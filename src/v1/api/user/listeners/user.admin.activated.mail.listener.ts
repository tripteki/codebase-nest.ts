import { OnEvent, } from "@nestjs/event-emitter";
import { AppMailNotificationListener, } from "src/app/listeners/app.mail.notification.listener";
import { UserAdminActivatedEvent, } from "src/v1/api/user/events/user.admin.activated.event";

/**
 * @class {UserAdminActivatedMailListener}
 * @extends {AppMailNotificationListener}
 */
export class UserAdminActivatedMailListener extends AppMailNotificationListener
{
    @OnEvent ("v1.user.admin.activated")
    /**
     * @param {UserAdminActivatedEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: UserAdminActivatedEvent): Promise<void>
    {
        await this.sendMail ({

            template: __dirname + "/../views/user.auth.account.mail.hbs",

            to: event.email,
            subject: this.i18nService.t ("_v1_user.account_activated.subject"),
            context: {
                close_greeting: this.i18nService.t ("_v1_user.common.close_greeting", { args: { appName: this.configService.get<string> ("app.name"), }, }),
                start_greeting: this.i18nService.t ("_v1_user.common.start_greeting", { args: { name: event.name, }, }),
                line: this.i18nService.t ("_v1_user.account_activated.line"),
                thank_you: this.i18nService.t ("_v1_user.account_activated.thank_you"),
            },
        });
    }
}
