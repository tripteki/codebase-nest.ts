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
import { HasherHelper, } from "src/app/helpers/hasher.helper";
import { ulid, } from "ulid";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";

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
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly eventListenerService: EventListenerService,
        private readonly prismaPostgreService: DatabasePrismaPostgreDriver,
        private readonly hasherHelper: HasherHelper,
        private readonly dateTimeHelper: DateTimeHelper
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
     * @param {Job} job
     * @returns {Promise<void>}
     */
    public async handle (job: Job<{ userId: string; file: string; }>): Promise<void>
    {
        const { userId, file, } = job.data;

        try {

            const data = await this.importFile (file);

            let totalImported = 0;
            let totalSkipped = 0;

            for (const row of data) {

                try {

                    const existingUser = await this.prismaPostgreService.user.findFirst ({
                        where: {
                            deleted_at: null,
                            OR: [
                                { email: row[this.i18nService.t ("_v1_user.import.column.email")] || row.email, },
                                { name: row[this.i18nService.t ("_v1_user.import.column.name")] || row.name, },
                            ],
                        },
                    });

                    if (existingUser) {

                        totalSkipped++;

                        continue;
                    }

                    const hashedPassword = await this.hasherHelper.hash (row[this.i18nService.t ("_v1_user.import.column.password")] || "12345678");

                    await this.prismaPostgreService.user.create ({
                        data: {
                            id: ulid (),
                            name: row[this.i18nService.t ("_v1_user.import.column.name")] || row.name,
                            email: row[this.i18nService.t ("_v1_user.import.column.email")] || row.email,
                            password: hashedPassword,
                            email_verified_at: row[this.i18nService.t ("_v1_user.import.column.email_verified")] === this.i18nService.t ("_v1_user.common.yes") ? this.dateTimeHelper.now () : null,
                            created_at: this.dateTimeHelper.now (),
                            updated_at: this.dateTimeHelper.now (),
                        },
                    });

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

        } catch (error: any) {

            this.eventListenerService.emit ("v1.user.admin.imported-failed", new UserAdminImportedFailedEvent ({

                userId,
                filename: file,
                error: error.message,
            }));
        }
    }
}
