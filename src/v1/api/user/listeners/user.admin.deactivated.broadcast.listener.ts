import { Inject, } from "@nestjs/common";
import { OnEvent, } from "@nestjs/event-emitter";
import { AppBroadcastNotificationListener, } from "src/app/listeners/app.broadcast.notification.listener";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { UserAdminDeactivatedEvent, } from "src/v1/api/user/events/user.admin.deactivated.event";
import { realtimeAccountPayload, } from "src/v1/api/user/support/realtime.account.payload";

/**
 * @class {UserAdminDeactivatedBroadcastListener}
 * @extends {AppBroadcastNotificationListener}
 */
export class UserAdminDeactivatedBroadcastListener extends AppBroadcastNotificationListener
{
    @Inject (DateTimeHelper)
    /**
     * @type {DateTimeHelper}
     */
    protected dateTimeHelper: DateTimeHelper;

    @OnEvent ("v1.user.admin.deactivated")
    /**
     * @param {UserAdminDeactivatedEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: UserAdminDeactivatedEvent): Promise<void>
    {
        const format = this.configService.get<string> ("app.datetimeFormat") || "YYYY-MM-DD HH:mm:ss";

        this.emitToUser (event.id, "v1.user.admin.deactivated", realtimeAccountPayload (event, this.dateTimeHelper, format));
    }
}
