import { OnEvent, } from "@nestjs/event-emitter";
import { AppBroadcastNotificationListener, } from "src/app/listeners/app.broadcast.notification.listener";
import { NotificationCreatedEvent, } from "src/v1/api/notification/events/notification.created.event";

/**
 * @class {NotificationCreatedBroadcastListener}
 * @extends {AppBroadcastNotificationListener}
 */
export class NotificationCreatedBroadcastListener extends AppBroadcastNotificationListener
{
    @OnEvent ("v1.notification.created")
    /**
     * @param {NotificationCreatedEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: NotificationCreatedEvent): Promise<void>
    {
        this.emitToUser (event.userId, "v1.notification.created", {
            id: event.notificationId,
            unread: event.unread,
        });
    }
}
