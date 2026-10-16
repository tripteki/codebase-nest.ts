import { OnEvent, } from "@nestjs/event-emitter";
import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { AppDatabaseNotificationListener, } from "src/app/listeners/app.database.notification.listener";
import { AclAdminExportedEvent, AclAdminExportedFailedEvent, } from "src/v1/api/acl/events/acl.admin.transfer.event";
import { NotificationCreateValidatorDto, } from "src/v1/api/notification/dtos/notification.validator.dto";
import { NotificationUserService, } from "src/v1/api/notification/services/notification.user.service";

@Injectable ()
/**
 * @class {AclAdminExportedDatabaseListener}
 * @extends {AppDatabaseNotificationListener}
 */
export class AclAdminExportedDatabaseListener extends AppDatabaseNotificationListener
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {NotificationUserService} notificationService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly notificationService: NotificationUserService
    )
    {
        super (configService, i18nService, notificationService);
    }

    @OnEvent ("v1.acl.admin.exported")
    /**
     * @param {AclAdminExportedEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: AclAdminExportedEvent): Promise<void>
    {
        await this.notificationService.notify (
            { userId: event.userId, },
            {
                type: `${event.subject}.export.completed`,
                data: {
                    filename: event.filename,
                    fileUrl: event.fileUrl,
                    message: this.i18nService.t ("_v1_acl.export.completed.message"),
                },
            } as unknown as NotificationCreateValidatorDto
        );
    }

    @OnEvent ("v1.acl.admin.exported-failed")
    /**
     * @param {AclAdminExportedFailedEvent} event
     * @returns {Promise<void>}
     */
    public async handleFailed (event: AclAdminExportedFailedEvent): Promise<void>
    {
        await this.notificationService.notify (
            { userId: event.userId, },
            {
                type: `${event.subject}.export.failed`,
                data: {
                    message: this.i18nService.t ("_v1_acl.export.failed.message"),
                    error: event.error,
                },
            } as unknown as NotificationCreateValidatorDto
        );
    }
}
