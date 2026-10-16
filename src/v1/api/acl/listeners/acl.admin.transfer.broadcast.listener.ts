import { Inject, } from "@nestjs/common";
import { OnEvent, } from "@nestjs/event-emitter";
import { EventEmitter2 as EventListenerService, } from "@nestjs/event-emitter";
import { ConfigService, } from "@nestjs/config";
import { JwtService, } from "@nestjs/jwt";
import { I18nService, } from "nestjs-i18n";
import { AppBroadcastNotificationListener, } from "src/app/listeners/app.broadcast.notification.listener";
import { AclAdminExportedEvent, AclAdminExportedFailedEvent, AclAdminImportedEvent, AclAdminImportedFailedEvent, } from "src/v1/api/acl/events/acl.admin.transfer.event";
import { UserAuthService, } from "src/v1/api/user/services/user.auth.service";

/**
 * @class {AclAdminTransferBroadcastListener}
 * @extends {AppBroadcastNotificationListener}
 */
export class AclAdminTransferBroadcastListener extends AppBroadcastNotificationListener
{
    @Inject (EventListenerService)
    /**
     * @type {EventListenerService}
     */
    protected eventListenerService: EventListenerService;

    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {UserAuthService} userAuthService
     * @param {JwtService} jwtService
     * @returns {void}
     */
    constructor (
        configService: ConfigService,
        i18nService: I18nService,
        userAuthService: UserAuthService,
        jwtService: JwtService
    )
    {
        super (configService, i18nService, userAuthService, jwtService);
    }

    /**
     * @param {"role" | "permission"} subject
     * @param {string} action
     * @returns {string}
     */
    protected socketEvent (subject: "role" | "permission", action: string): string
    {
        return `v1.acl.${subject}.admin.${action}`;
    }

    @OnEvent ("v1.acl.admin.imported")
    /**
     * @param {AclAdminImportedEvent} event
     * @returns {void}
     */
    public handleImported (event: AclAdminImportedEvent): void
    {
        this.emitToUser (event.userId, this.socketEvent (event.subject, "imported"), {
            userId: event.userId,
            filename: event.filename,
            totalImported: event.totalImported,
            totalSkipped: event.totalSkipped,
        });

        if (event.totalImported > 0) {
            this.eventListenerService.emit ("v1.admin.refresh", {
                subjectType: event.subject === "role" ? "Role" : "Permission",
                causerId: event.userId,
            });
        }
    }

    @OnEvent ("v1.acl.admin.imported-failed")
    /**
     * @param {AclAdminImportedFailedEvent} event
     * @returns {void}
     */
    public handleImportedFailed (event: AclAdminImportedFailedEvent): void
    {
        this.emitToUser (event.userId, this.socketEvent (event.subject, "imported-failed"), {
            userId: event.userId,
            filename: event.filename,
            error: event.error,
        });
    }

    @OnEvent ("v1.acl.admin.exported")
    /**
     * @param {AclAdminExportedEvent} event
     * @returns {void}
     */
    public handleExported (event: AclAdminExportedEvent): void
    {
        this.emitToUser (event.userId, this.socketEvent (event.subject, "exported"), {
            userId: event.userId,
            filename: event.filename,
            fileUrl: event.fileUrl,
        });
    }

    @OnEvent ("v1.acl.admin.exported-failed")
    /**
     * @param {AclAdminExportedFailedEvent} event
     * @returns {void}
     */
    public handleExportedFailed (event: AclAdminExportedFailedEvent): void
    {
        this.emitToUser (event.userId, this.socketEvent (event.subject, "exported-failed"), {
            userId: event.userId,
            error: event.error,
        });
    }
}
