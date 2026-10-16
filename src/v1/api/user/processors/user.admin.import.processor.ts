import { Injectable, } from "@nestjs/common";
import { Processor, Process, } from "@nestjs/bull";
import { Job, } from "bull";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { EventEmitter2 as EventListenerService, } from "@nestjs/event-emitter";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { AppImportProcessor, } from "src/app/processors/app.import.processor";
import { UserAdminImportedEvent, } from "src/v1/api/user/events/user.admin.imported.event";
import { UserAdminImportedFailedEvent, } from "src/v1/api/user/events/user.admin.imported.failed.event";
import { UserAclRepository, } from "src/v1/api/user/repositories/user.acl.repository";
import { HasherHelper, } from "src/app/helpers/hasher.helper";
import { ActivityRecorder, } from "src/v1/api/log/support/activity.recorder";
import { UserAuthRegisteredEvent, } from "src/v1/api/user/events/user.auth.registered.event";
import { UserRoleEnum, } from "src/v1/api/user/dtos/user.role.enum";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { ulid, } from "ulid";
import { AccountNotifier, } from "src/v1/api/user/support/account.notifier";

@Injectable ()
@Processor ("user-admin-queue")
/**
 * @class {UserAdminImportProcessor}
 * @extends {AppImportProcessor}
 */
export class UserAdminImportProcessor extends AppImportProcessor
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {EventListenerService} eventListenerService
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @param {HasherHelper} hasherHelper
     * @param {DateTimeHelper} dateTimeHelper
     * @param {UserAclRepository} userAclRepository
     * @param {ActivityRecorder} activityRecorder
     * @param {AccountNotifier} accountNotifier
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly eventListenerService: EventListenerService,
        private readonly prismaPostgreService: DatabasePrismaPostgreDriver,
        private readonly hasherHelper: HasherHelper,
        private readonly dateTimeHelper: DateTimeHelper,
        private readonly userAclRepository: UserAclRepository,
        private readonly activityRecorder: ActivityRecorder,
        private readonly accountNotifier: AccountNotifier
    )
    {
        super (
            configService,
            i18nService,
            eventListenerService
        );
    }

    @Process ("import")
    /**
     * @param {Job<{ userId: string; file: string; }>} job
     * @returns {Promise<void>}
     */
    public async handle (job: Job<{ userId: string; file: string; }>): Promise<void>
    {
        const { userId, file, } = job.data;

        try {

            const data = await this.importFile (file);

            if (! data.length) throw new Error (this.i18nService.t ("_app.processor.import.empty_file"));

            const columns = new Set (data.flatMap ((row) => Object.keys (row)));
            const missing = [ "email", "password", ].filter ((column) => ! columns.has (column));

            if (missing.length > 0) {
                throw new Error (this.i18nService.t ("_app.processor.import.missing_columns", { args: { columns: missing.join (", "), }, }));
            }

            if (! columns.has ("name") && ! columns.has ("full_name")) {
                throw new Error (this.i18nService.t ("_app.processor.import.missing_columns", { args: { columns: "name", }, }));
            }

            let totalImported = 0;
            let totalSkipped = 0;

            for (const row of data) {

                try {

                    const email = String (row[this.i18nService.t ("_v1_user.import.column.email")] || row.email || "").trim ();
                    const password = String (row[this.i18nService.t ("_v1_user.import.column.password")] || row.password || "").trim ();
                    const nameCell = String (row[this.i18nService.t ("_v1_user.import.column.name")] || row.name || "").trim ();
                    const fullNameCell = String (row.full_name || "").trim ();
                    const displayName = nameCell || fullNameCell;
                    const fullName = fullNameCell || displayName;

                    if (! email || ! password || ! displayName) {
                        totalSkipped++;
                        continue;
                    }

                    const existingUser = await this.prismaPostgreService.user.findFirst ({
                        where: { email, },
                        select: { id: true, },
                    });

                    if (existingUser) {

                        totalSkipped++;

                        continue;
                    }

                    const statusValue = String (row.status || row[this.i18nService.t ("_v1_user.import.column.status")] || "").trim ().toLowerCase ();
                    const verifiedFlag = row[this.i18nService.t ("_v1_user.import.column.email_verified")] === this.i18nService.t ("_v1_user.common.yes");
                    const resolvedStatus = statusValue || (verifiedFlag ? "active" : "unverified");

                    if (! ["active", "unverified", "deactivated",].includes (resolvedStatus)) {
                        totalSkipped++;
                        continue;
                    }

                    const now = this.dateTimeHelper.now ();
                    const hashedPassword = await this.hasherHelper.hash (password);

                    const created = await this.prismaPostgreService.user.create ({
                        data: {
                            id: ulid (),
                            name: displayName,
                            email,
                            password: hashedPassword,
                            email_verified_at: resolvedStatus === "unverified" ? null : now,
                            deleted_at: resolvedStatus === "deactivated" ? now : null,
                            created_at: now,
                            updated_at: now,
                        },
                    });

                    await this.prismaPostgreService.profile.create ({
                        data: {
                            id: ulid (),
                            user_id: created.id,
                            full_name: fullName,
                            interests: [],
                            created_at: now,
                            updated_at: now,
                        },
                    });

                    await this.userAclRepository.assignDefaultUserRole (created.id);

                    await this.activityRecorder.log ("user created", "created", "User", created.id, userId, {
                        attributes: {
                            full_name: fullName,
                            email: created.email,
                            role: UserRoleEnum.User,
                        },
                    });

                    if (resolvedStatus === "active") {
                        await this.accountNotifier.accountCreated (created, UserRoleEnum.User);
                    } else if (resolvedStatus === "unverified") {
                        this.eventListenerService.emit ("v1.user.auth.reverify", new UserAuthRegisteredEvent ({
                            id: created.id,
                            name: fullName,
                            email: created.email,
                            email_verified_at: created.email_verified_at,
                            created_at: created.created_at,
                            updated_at: created.updated_at,
                        }));
                    }

                    totalImported++;

                } catch (error: any) {

                    totalSkipped++;

                    continue;
                }
            }

            this.eventListenerService.emit ("v1.user.admin.imported", new UserAdminImportedEvent ({

                userId,
                filename: file,
                totalImported,
                totalSkipped,
            }));

            if (totalImported > 0) {
                this.eventListenerService.emit ("v1.admin.refresh", {
                    subjectType: "User",
                    causerId: userId,
                });
            }

        } catch (error: any) {

            this.eventListenerService.emit ("v1.user.admin.imported-failed", new UserAdminImportedFailedEvent ({

                userId,
                filename: file,
                error: error.message,
            }));
        }
    }
}
