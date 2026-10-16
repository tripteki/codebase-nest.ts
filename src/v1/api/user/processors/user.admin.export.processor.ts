import { Injectable, } from "@nestjs/common";
import { Processor, Process, } from "@nestjs/bull";
import { Job, } from "bull";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { EventEmitter2 as EventListenerService, } from "@nestjs/event-emitter";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { AppExportProcessor, } from "src/app/processors/app.export.processor";
import { UserAdminExportedEvent, } from "src/v1/api/user/events/user.admin.exported.event";
import { UserAdminExportedFailedEvent, } from "src/v1/api/user/events/user.admin.exported.failed.event";
import { UserAdminRepository, } from "src/v1/api/user/repositories/user.admin.repository";
import { Filterization, Orderization, } from "src/app/repositories/app.repository";
import { User, } from "@prisma/client";

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
     * @param {DateTimeHelper} dateTimeHelper
     * @param {UserAdminRepository} userAdminRepository
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly eventListenerService: EventListenerService,
        private readonly prismaPostgreService: DatabasePrismaPostgreDriver,
        private readonly dateTimeHelper: DateTimeHelper,
        private readonly userAdminRepository: UserAdminRepository
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
     * @param {Job<{ userId: string; type?: string; orders?: Orderization<User>[]; filters?: Filterization<User>[]; }>} job
     * @returns {Promise<void>}
     */
    public async handle (job: Job<{ userId: string; type?: string; orders?: Orderization<User>[]; filters?: Filterization<User>[]; }>): Promise<void>
    {
        const { userId, type = "csv", orders = [], filters = [], } = job.data;

        try {

            const users = await this.userAdminRepository.exportRows (filters, orders);

            if (! users.length) throw new Error ("No users found to export");

            const links = await this.prismaPostgreService.modelHasRole.findMany ({
                where: {
                    model_type: "User",
                    model_id: { in: users.map ((user) => user.id), },
                    role: { guard_name: "web", },
                },
                include: { role: true, },
            });
            const roleByUser = new Map<string, string> ();

            for (const link of links) roleByUser.set (link.model_id, link.role.name);

            const format = this.configService.get<string> ("app.datetimeFormat") || "YYYY-MM-DD HH:mm:ss";
            const data = users.map ((user) => {
                const status = user.deleted_at ? "deactivated" : (user.email_verified_at ? "active" : "unverified");

                return {
                    full_name: user.profile?.full_name || user.name,
                    email: user.email,
                    role: roleByUser.get (user.id) || null,
                    status,
                    created_at: this.dateTimeHelper.ref () (user.created_at).format (format),
                };
            });

            const stamp = this.dateTimeHelper.ref () ().format ("YYYYMMDD_HHmmss");
            const filename = `users_export_${stamp}.${type}`;
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
