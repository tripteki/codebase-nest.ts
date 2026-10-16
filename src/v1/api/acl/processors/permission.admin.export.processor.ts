import { Injectable, } from "@nestjs/common";
import { Processor, Process, } from "@nestjs/bull";
import { Job, } from "bull";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { EventEmitter2 as EventListenerService, } from "@nestjs/event-emitter";
import { Prisma, } from "@prisma/client";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { AppExportProcessor, } from "src/app/processors/app.export.processor";
import { AclAdminExportedEvent, AclAdminExportedFailedEvent, } from "src/v1/api/acl/events/acl.admin.transfer.event";

@Injectable ()
@Processor ("acl-admin-queue")
/**
 * @class {PermissionAdminExportProcessor}
 * @extends {AppExportProcessor}
 */
export class PermissionAdminExportProcessor extends AppExportProcessor
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

    @Process ("permission-export")
    /**
     * @param {Job<{ userId: string; type?: string; where?: Prisma.PermissionWhereInput; }>} job
     * @returns {Promise<void>}
     */
    public async handle (job: Job<{ userId: string; type?: string; where?: Prisma.PermissionWhereInput; }>): Promise<void>
    {
        const { userId, type = "csv", where = {}, } = job.data;

        try {
            const permissions = await this.prismaPostgreService.permission.findMany ({
                where,
                orderBy: { name: "asc", },
            });

            if (permissions.length === 0) throw new Error ("No permissions found to export");

            const data = permissions.map ((permission) => ({
                name: permission.name,
                guard_name: permission.guard_name,
            }));
            const stamp = this.dateTimeHelper.ref () ().format ("YYYYMMDD_HHmmss");
            const filename = `permissions_export_${stamp}.${type}`;
            const { filePath, fileUrl, } = await this.exportFile (data, filename, type, "export", "Permissions");

            this.eventListenerService.emit ("v1.acl.admin.exported", new AclAdminExportedEvent ({
                userId,
                filename,
                fileUrl,
                filePath,
                subject: "permission",
            }));
        } catch (error: any) {
            this.eventListenerService.emit ("v1.acl.admin.exported-failed", new AclAdminExportedFailedEvent ({
                userId,
                error: error.message,
                subject: "permission",
            }));
        }
    }
}
