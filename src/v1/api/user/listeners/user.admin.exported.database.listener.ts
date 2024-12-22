import { OnEvent, } from "@nestjs/event-emitter";
import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { NotificationUserService, } from "src/v1/api/notification/services/notification.user.service";
import { AppDatabaseNotificationListener, } from "src/app/listeners/app.database.notification.listener";
import { UserAdminExportedEvent, } from "src/v1/api/user/events/user.admin.exported.event";
import { UserAdminExportedFailedEvent, } from "src/v1/api/user/events/user.admin.exported.failed.event";
import { NotificationCreateValidatorDto, } from "src/v1/api/notification/dtos/notification.validator.dto";

@Injectable ()
/**
 * @class {UserAdminExportedDatabaseListener}
 * @extends {AppDatabaseNotificationListener}
 */
export class UserAdminExportedDatabaseListener extends AppDatabaseNotificationListener
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
        super (
            configService,
            i18nService,
            notificationService
        );
    }

    @OnEvent ("v1.user.admin.exported")
    /**
     * @param {UserAdminExportedEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: UserAdminExportedEvent): Promise<void>
    {
        await this.notificationService.notify (
            { userId: event.userId, },
            {
                type: "user.export.completed",
                data: {
                    filename: event.filename,
                    fileUrl: event.fileUrl,
                    message: this.i18nService.t ("_v1_user.export.completed.message"),
                },
            } as unknown as NotificationCreateValidatorDto
        );
    }

    @OnEvent ("v1.user.admin.exported-failed")
    /**
     * @param {UserAdminExportedFailedEvent} event
     * @returns {Promise<void>}
     */
    public async handleFailed (event: UserAdminExportedFailedEvent): Promise<void>
    {
        await this.notificationService.notify (
            { userId: event.userId, },
            {
                type: "user.export.failed",
                data: {
                    message: this.i18nService.t ("_v1_user.export.failed.message"),
                    error: event.error,
                },
            } as unknown as NotificationCreateValidatorDto
        );
    }
}
