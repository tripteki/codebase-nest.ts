import { OnEvent, } from "@nestjs/event-emitter";
import { AppMailNotificationListener, } from "src/app/listeners/app.mail.notification.listener";
import { UserAuthResetEvent, } from "src/v1/api/user/events/user.auth.reset.event";

/**
 * @class {UserAuthResetMailListener}
 * @extends {AppMailNotificationListener}
 */
export class UserAuthResetMailListener extends AppMailNotificationListener
{
    @OnEvent ("v1.user.auth.reset")
    /**
     * @param {UserAuthResetEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: UserAuthResetEvent): Promise<void>
    {
        await this.sendMail ({

            template: __dirname + "/../views/user.auth.reset.mail.hbs",

            to: event.email,
            subject: this.i18nService.t ("_v1_user.account_reset.subject"),
            context: {
                close_greeting: this.i18nService.t ("_v1_user.common.close_greeting", { args: { appName: this.configService.get<string> ("app.name"), }, }),
                start_greeting: this.i18nService.t ("_v1_user.common.start_greeting", { args: { name: event.user.name, }, }),
                line1: this.i18nService.t ("_v1_user.account_reset.line1"),
                line2: this.i18nService.t ("_v1_user.account_reset.line2"),
                reset: this.i18nService.t ("_v1_user.account_reset.reset"),
                link: event.token,
            },
        });
    }
}
