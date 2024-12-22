import { OnEvent, } from "@nestjs/event-emitter";
import { AppBroadcastNotificationListener, } from "src/app/listeners/app.broadcast.notification.listener";
import { UserAdminExportedEvent, } from "src/v1/api/user/events/user.admin.exported.event";
import { UserAdminExportedFailedEvent, } from "src/v1/api/user/events/user.admin.exported.failed.event";

/**
 * @class {UserAdminExportedBroadcastListener}
 * @extends {AppBroadcastNotificationListener}
 */
export class UserAdminExportedBroadcastListener extends AppBroadcastNotificationListener
{
    @OnEvent ("v1.user.admin.exported")
    /**
     * @param {UserAdminExportedEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: UserAdminExportedEvent): Promise<void>
    {
        this.serverBroadcaster.emit ("v1.user.admin.exported", event);
    }

    @OnEvent ("v1.user.admin.exported-failed")
    /**
     * @param {UserAdminExportedFailedEvent} event
     * @returns {Promise<void>}
     */
    public async handleFailed (event: UserAdminExportedFailedEvent): Promise<void>
    {
        this.serverBroadcaster.emit ("v1.user.admin.exported-failed", event);
    }
}
