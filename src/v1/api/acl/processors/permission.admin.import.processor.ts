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
import { isSystemPermission, } from "src/v1/api/acl/support/system.permission.guard";
import { ulid, } from "ulid";

/**
 * @type {string[]}
 */
const GUARDS = [ "web", "api", ];

@Injectable ()
@Processor ("acl-admin-queue")
/**
 * @class {PermissionAdminImportProcessor}
 * @extends {AppImportProcessor}
 */
export class PermissionAdminImportProcessor extends AppImportProcessor
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

    @Process ("permission-import")
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

                    if (! name || ! GUARDS.includes (guard) || isSystemPermission (name)) {
                        totalSkipped++;
                        continue;
                    }

                    const existing = await this.prismaPostgreService.permission.findFirst ({
                        where: { name, guard_name: guard, },
                    });

                    if (existing) {
                        totalSkipped++;
                        continue;
                    }

                    const now = this.dateTimeHelper.now ();

                    await this.prismaPostgreService.permission.create ({
                        data: {
                            id: ulid (),
                            name,
                            guard_name: guard,
                            created_at: now,
                            updated_at: now,
                        },
                    });
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
                subject: "permission",
            }));
        } catch (error: any) {
            this.eventListenerService.emit ("v1.acl.admin.imported-failed", new AclAdminImportedFailedEvent ({
                userId,
                filename: file,
                error: error.message,
                subject: "permission",
            }));
        }
    }
}
