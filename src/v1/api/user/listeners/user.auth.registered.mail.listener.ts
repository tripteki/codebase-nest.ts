import { OnEvent, } from "@nestjs/event-emitter";
import { AppMailNotificationListener, } from "src/app/listeners/app.mail.notification.listener";
import { UserAuthRegisteredEvent, } from "src/v1/api/user/events/user.auth.registered.event";

/**
 * @class {UserAuthRegisteredMailListener}
 * @extends {AppMailNotificationListener}
 */
export class UserAuthRegisteredMailListener extends AppMailNotificationListener
{
    @OnEvent ("v1.user.auth.registered")
    @OnEvent ("v1.user.auth.reverify")
    /**
     * @param {UserAuthRegisteredEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: UserAuthRegisteredEvent): Promise<void>
    {
        await this.sendMail ({

            template: __dirname + "/../views/user.auth.verification.mail.hbs",

            to: event.email,
            subject: this.i18nService.t ("_v1_user.account_registered.subject"),
            context: {
                close_greeting: this.i18nService.t ("_v1_user.common.close_greeting", { args: { appName: this.configService.get<string> ("app.name"), }, }),
                start_greeting: this.i18nService.t ("_v1_user.common.start_greeting", { args: { name: event.name, }, }),
                line1: this.i18nService.t ("_v1_user.account_registered.line1"),
                line2: this.i18nService.t ("_v1_user.account_registered.line2"),
                verify: this.i18nService.t ("_v1_user.account_registered.verify"),
                link: this.urlHelper.ref ().sign (`${this.configService.get<string> ("app.frontendUrl")}/auth/verify-email/${event.email}`),
            },
        });
    }
}
