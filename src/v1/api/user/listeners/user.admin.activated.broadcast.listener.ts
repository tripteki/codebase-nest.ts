import { Inject, } from "@nestjs/common";
import { OnEvent, } from "@nestjs/event-emitter";
import { AppBroadcastNotificationListener, } from "src/app/listeners/app.broadcast.notification.listener";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { UserAdminActivatedEvent, } from "src/v1/api/user/events/user.admin.activated.event";
import { realtimeAccountPayload, } from "src/v1/api/user/support/realtime.account.payload";

/**
 * @class {UserAdminActivatedBroadcastListener}
 * @extends {AppBroadcastNotificationListener}
 */
export class UserAdminActivatedBroadcastListener extends AppBroadcastNotificationListener
{
    @Inject (DateTimeHelper)
    /**
     * @type {DateTimeHelper}
     */
    protected dateTimeHelper: DateTimeHelper;

    @OnEvent ("v1.user.admin.activated")
    /**
     * @param {UserAdminActivatedEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: UserAdminActivatedEvent): Promise<void>
    {
        const format = this.configService.get<string> ("app.datetimeFormat") || "YYYY-MM-DD HH:mm:ss";

        this.emitToUser (event.id, "v1.user.admin.activated", realtimeAccountPayload (event, this.dateTimeHelper, format));
    }
}
