import { OnEvent, } from "@nestjs/event-emitter";
import { AppBroadcastNotificationListener, } from "src/app/listeners/app.broadcast.notification.listener";
import { UserAdminImportedEvent, } from "src/v1/api/user/events/user.admin.imported.event";
import { UserAdminImportedFailedEvent, } from "src/v1/api/user/events/user.admin.imported.failed.event";

/**
 * @class {UserAdminImportedBroadcastListener}
 * @extends {AppBroadcastNotificationListener}
 */
export class UserAdminImportedBroadcastListener extends AppBroadcastNotificationListener
{
    @OnEvent ("v1.user.admin.imported")
    /**
     * @param {UserAdminImportedEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: UserAdminImportedEvent): Promise<void>
    {
        this.serverBroadcaster.emit ("v1.user.admin.imported", event);
    }

    @OnEvent ("v1.user.admin.imported-failed")
    /**
     * @param {UserAdminImportedFailedEvent} event
     * @returns {Promise<void>}
     */
    public async handleFailed (event: UserAdminImportedFailedEvent): Promise<void>
    {
        this.serverBroadcaster.emit ("v1.user.admin.imported-failed", event);
    }
}
