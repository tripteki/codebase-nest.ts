import { OnEvent, } from "@nestjs/event-emitter";
import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { NotificationUserService, } from "src/v1/api/notification/services/notification.user.service";
import { AppDatabaseNotificationListener, } from "src/app/listeners/app.database.notification.listener";
import { UserAdminImportedEvent, } from "src/v1/api/user/events/user.admin.imported.event";
import { UserAdminImportedFailedEvent, } from "src/v1/api/user/events/user.admin.imported.failed.event";
import { NotificationCreateValidatorDto, } from "src/v1/api/notification/dtos/notification.validator.dto";

@Injectable ()
/**
 * @class {UserAdminImportedDatabaseListener}
 * @extends {AppDatabaseNotificationListener}
 */
export class UserAdminImportedDatabaseListener extends AppDatabaseNotificationListener
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

    @OnEvent ("v1.user.admin.imported")
    /**
     * @param {UserAdminImportedEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: UserAdminImportedEvent): Promise<void>
    {
        await this.notificationService.notify (
            { userId: event.userId, },
            {
                type: "user.import.completed",
                data: {
                    filename: event.filename,
                    totalImported: event.totalImported,
                    totalSkipped: event.totalSkipped,
                    message: this.i18nService.t ("_v1_user.import.completed.message", { args: { totalImported: event.totalImported, totalSkipped: event.totalSkipped, }, }),
                },
            } as unknown as NotificationCreateValidatorDto
        );
    }

    @OnEvent ("v1.user.admin.imported-failed")
    /**
     * @param {UserAdminImportedFailedEvent} event
     * @returns {Promise<void>}
     */
    public async handleFailed (event: UserAdminImportedFailedEvent): Promise<void>
    {
        await this.notificationService.notify (
            { userId: event.userId, },
            {
                type: "user.import.failed",
                data: {
                    filename: event.filename,
                    message: this.i18nService.t ("_v1_user.import.failed.message"),
                    error: event.error,
                },
            } as unknown as NotificationCreateValidatorDto
        );
    }
}
