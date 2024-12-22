import { OnEvent, } from "@nestjs/event-emitter";
import { AppBroadcastNotificationListener, } from "src/app/listeners/app.broadcast.notification.listener";
import { UserAdminActivatedEvent, } from "src/v1/api/user/events/user.admin.activated.event";

/**
 * @class {UserAdminActivatedBroadcastListener}
 * @extends {AppBroadcastNotificationListener}
 */
export class UserAdminActivatedBroadcastListener extends AppBroadcastNotificationListener
{
    @OnEvent ("v1.user.admin.activated")
    /**
     * @param {UserAdminActivatedEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: UserAdminActivatedEvent): Promise<void>
    {
        this.serverBroadcaster.emit ("v1.user.admin.activated", event);
    }
}
