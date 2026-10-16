import { Injectable, } from "@nestjs/common";
import { Processor, Process, } from "@nestjs/bull";
import { Job, } from "bull";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { EventEmitter2 as EventListenerService, } from "@nestjs/event-emitter";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { AppImportProcessor, } from "src/app/processors/app.import.processor";
import { AclAdminImportedEvent, AclAdminImportedFailedEvent, } from "src/v1/api/acl/events/acl.admin.transfer.event";
import { isSystemRole, } from "src/v1/api/acl/support/system.role.guard";
import { ulid, } from "ulid";

/**
 * @type {string[]}
 */
const GUARDS = [ "web", "api", ];

@Injectable ()
@Processor ("acl-admin-queue")
/**
 * @class {RoleAdminImportProcessor}
 * @extends {AppImportProcessor}
 */
export class RoleAdminImportProcessor extends AppImportProcessor
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {EventListenerService} eventListenerService
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @param {DateTimeHelper} dateTimeHelper
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly eventListenerService: EventListenerService,
        protected readonly prismaPostgreService: DatabasePrismaPostgreDriver,
        protected readonly dateTimeHelper: DateTimeHelper
    )
    {
        super (configService, i18nService, eventListenerService);
    }

    @Process ("role-import")
    /**
     * @param {Job<{ userId: string; file: string; }>} job
     * @returns {Promise<void>}
     */
    public async handle (job: Job<{ userId: string; file: string; }>): Promise<void>
    {
        const { userId, file, } = job.data;

        try {
            const rows = await this.importFile (file);

            if (! rows.length) throw new Error (this.i18nService.t ("_app.processor.import.empty_file"));

            const columns = new Set (rows.flatMap ((row) => Object.keys (row)));
            const missing = [ "name", "guard_name", ].filter ((column) => ! columns.has (column));

            if (missing.length > 0) {
                throw new Error (this.i18nService.t ("_app.processor.import.missing_columns", { args: { columns: missing.join (", "), }, }));
            }

            let totalImported = 0;
            let totalSkipped = 0;

            for (const row of rows) {
                try {
                    const name = String (row.name || "").trim ();
                    const guard = String (row.guard_name || "web").trim ().toLowerCase ();

                    if (! name || ! GUARDS.includes (guard) || isSystemRole (name)) {
                        totalSkipped++;
                        continue;
                    }

                    const permissionNames = String (row.permissions || "")
                        .split (",")
                        .map ((item) => item.trim ())
                        .filter (Boolean);
                    const permissions = permissionNames.length > 0
                        ? await this.prismaPostgreService.permission.findMany ({
                            where: { name: { in: permissionNames, }, guard_name: guard, },
                        })
                        : [];
                    const existing = await this.prismaPostgreService.role.findFirst ({
                        where: { name, guard_name: guard, },
                    });
                    const now = this.dateTimeHelper.now ();

                    if (existing) {
                        await this.prismaPostgreService.roleHasPermission.deleteMany ({ where: { role_id: existing.id, }, });
                        if (permissions.length > 0) {
                            await this.prismaPostgreService.roleHasPermission.createMany ({
                                data: permissions.map ((permission) => ({
                                    role_id: existing.id,
                                    permission_id: permission.id,
                                })),
                            });
                        }
                    } else {
                        await this.prismaPostgreService.role.create ({
                            data: {
                                id: ulid (),
                                name,
                                guard_name: guard,
                                created_at: now,
                                updated_at: now,
                                permissions: {
                                    create: permissions.map ((permission) => ({ permission_id: permission.id, })),
                                },
                            },
                        });
                    }

                    totalImported++;
                } catch {
                    totalSkipped++;
                }
            }

            this.eventListenerService.emit ("v1.acl.admin.imported", new AclAdminImportedEvent ({
                userId,
                filename: file,
                totalImported,
                totalSkipped,
                subject: "role",
            }));
        } catch (error: any) {
            this.eventListenerService.emit ("v1.acl.admin.imported-failed", new AclAdminImportedFailedEvent ({
                userId,
                filename: file,
                error: error.message,
                subject: "role",
            }));
        }
    }
}
