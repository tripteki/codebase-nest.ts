import { OnEvent, } from "@nestjs/event-emitter";
import { AppMailNotificationListener, } from "src/app/listeners/app.mail.notification.listener";
import { UserAdminDeactivatedEvent, } from "src/v1/api/user/events/user.admin.deactivated.event";

/**
 * @class {UserAdminDeactivatedMailListener}
 * @extends {AppMailNotificationListener}
 */
export class UserAdminDeactivatedMailListener extends AppMailNotificationListener
{
    @OnEvent ("v1.user.admin.deactivated")
    /**
     * @param {UserAdminDeactivatedEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: UserAdminDeactivatedEvent): Promise<void>
    {
        await this.sendMail ({

            template: __dirname + "/../views/user.auth.account.mail.hbs",

            to: event.email,
            subject: this.i18nService.t ("_v1_user.account_deactivated.subject"),
            context: {
                close_greeting: this.i18nService.t ("_v1_user.common.close_greeting", { args: { appName: this.configService.get<string> ("app.name"), }, }),
                start_greeting: this.i18nService.t ("_v1_user.common.start_greeting", { args: { name: event.name, }, }),
                line: this.i18nService.t ("_v1_user.account_deactivated.line"),
                thank_you: this.i18nService.t ("_v1_user.account_deactivated.thank_you"),
            },
        });
    }
}
