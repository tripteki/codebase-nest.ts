import { Injectable, } from "@nestjs/common";
import { Processor, Process, } from "@nestjs/bull";
import { Job, } from "bull";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { EventEmitter2 as EventListenerService, } from "@nestjs/event-emitter";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { AppExportProcessor, } from "src/app/processors/app.export.processor";
import { UserAdminExportedEvent, } from "src/v1/api/user/events/user.admin.exported.event";
import { UserAdminExportedFailedEvent, } from "src/v1/api/user/events/user.admin.exported.failed.event";

@Injectable ()
@Processor ("user-admin-queue")
/**
 * @class {UserAdminExportProcessor}
 * @extends {AppExportProcessor}
 */
export class UserAdminExportProcessor extends AppExportProcessor
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {EventListenerService} eventListenerService
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly eventListenerService: EventListenerService,
        private readonly prismaPostgreService: DatabasePrismaPostgreDriver
    )
    {
        super (
            configService,
            i18nService,
            eventListenerService
        );
    }

    @Process ("export")
    /**
     * @param {Job} job
     * @returns {Promise<void>}
     */
    public async handle (job: Job<{ userId: string; type?: string; }>): Promise<void>
    {
        const { userId, type = "csv", } = job.data;

        try {

            const users = await this.prismaPostgreService.user.findMany ({
                where: {
                    deleted_at: null,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    email_verified_at: true,
                    created_at: true,
                    updated_at: true,
                },
            });

            const data = users.map ((user) => ({

                [this.i18nService.t ("_v1_user.export.column.id")]: user.id,
                [this.i18nService.t ("_v1_user.export.column.name")]: user.name,
                [this.i18nService.t ("_v1_user.export.column.email")]: user.email,
                [this.i18nService.t ("_v1_user.export.column.email_verified")]: user.email_verified_at ? this.i18nService.t ("_v1_user.common.yes") : this.i18nService.t ("_v1_user.common.no"),
                [this.i18nService.t ("_v1_user.export.column.created_at")]: user.created_at.toISOString (),
                [this.i18nService.t ("_v1_user.export.column.updated_at")]: user.updated_at.toISOString (),
            }));

            const filename = `users_export_${Date.now ()}.${type}`;
            const sheetName = this.i18nService.t ("_v1_user.export.sheet_name");
            const { filePath, fileUrl, } = await this.exportFile (data, filename, type, "export", sheetName);

            this.eventListenerService.emit ("v1.user.admin.exported", new UserAdminExportedEvent ({

                userId,
                filename,
                fileUrl,
                filePath,
            }));

        } catch (error: any) {

            this.eventListenerService.emit ("v1.user.admin.exported-failed", new UserAdminExportedFailedEvent ({

                userId,
                error: error.message,
            }));
        }
    }
}
