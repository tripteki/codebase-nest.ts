import { OnEvent, } from "@nestjs/event-emitter";
import { AppBroadcastNotificationListener, } from "src/app/listeners/app.broadcast.notification.listener";
import { UserAdminDeactivatedEvent, } from "src/v1/api/user/events/user.admin.deactivated.event";

/**
 * @class {UserAdminDeactivatedBroadcastListener}
 * @extends {AppBroadcastNotificationListener}
 */
export class UserAdminDeactivatedBroadcastListener extends AppBroadcastNotificationListener
{
    @OnEvent ("v1.user.admin.deactivated")
    /**
     * @param {UserAdminDeactivatedEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: UserAdminDeactivatedEvent): Promise<void>
    {
        this.serverBroadcaster.emit ("v1.user.admin.deactivated", event);
    }
}
