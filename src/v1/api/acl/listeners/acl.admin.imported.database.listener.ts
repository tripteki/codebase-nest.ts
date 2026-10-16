import { OnEvent, } from "@nestjs/event-emitter";
import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { AppDatabaseNotificationListener, } from "src/app/listeners/app.database.notification.listener";
import { AclAdminImportedEvent, AclAdminImportedFailedEvent, } from "src/v1/api/acl/events/acl.admin.transfer.event";
import { NotificationCreateValidatorDto, } from "src/v1/api/notification/dtos/notification.validator.dto";
import { NotificationUserService, } from "src/v1/api/notification/services/notification.user.service";

@Injectable ()
/**
 * @class {AclAdminImportedDatabaseListener}
 * @extends {AppDatabaseNotificationListener}
 */
export class AclAdminImportedDatabaseListener extends AppDatabaseNotificationListener
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

    @OnEvent ("v1.acl.admin.imported")
    /**
     * @param {AclAdminImportedEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: AclAdminImportedEvent): Promise<void>
    {
        await this.notificationService.notify (
            { userId: event.userId, },
            {
                type: `${event.subject}.import.completed`,
                data: {
                    filename: event.filename,
                    totalImported: event.totalImported,
                    totalSkipped: event.totalSkipped,
                    message: this.i18nService.t ("_v1_acl.import.completed.message", {
                        args: { totalImported: event.totalImported, totalSkipped: event.totalSkipped, },
                    }),
                },
            } as unknown as NotificationCreateValidatorDto
        );
    }

    @OnEvent ("v1.acl.admin.imported-failed")
    /**
     * @param {AclAdminImportedFailedEvent} event
     * @returns {Promise<void>}
     */
    public async handleFailed (event: AclAdminImportedFailedEvent): Promise<void>
    {
        await this.notificationService.notify (
            { userId: event.userId, },
            {
                type: `${event.subject}.import.failed`,
                data: {
                    filename: event.filename,
                    message: this.i18nService.t ("_v1_acl.import.failed.message"),
                    error: event.error,
                },
            } as unknown as NotificationCreateValidatorDto
        );
    }
}
