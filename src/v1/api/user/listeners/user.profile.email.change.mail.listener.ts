import { OnEvent, } from "@nestjs/event-emitter";
import { AppMailNotificationListener, } from "src/app/listeners/app.mail.notification.listener";
import { UserAuthRegisteredEvent, } from "src/v1/api/user/events/user.auth.registered.event";

/**
 * @class {UserProfileEmailChangeMailListener}
 * @extends {AppMailNotificationListener}
 */
export class UserProfileEmailChangeMailListener extends AppMailNotificationListener
{
    @OnEvent ("v1.user.profile.email-change")
    /**
     * @param {UserAuthRegisteredEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: UserAuthRegisteredEvent): Promise<void>
    {
        await this.sendMail ({
            template: __dirname + "/../views/user.auth.verification.mail.hbs",
            to: event.email,
            subject: this.i18nService.t ("_v1_user.account_email_change.subject"),
            context: {
                close_greeting: this.i18nService.t ("_v1_user.common.close_greeting", { args: { appName: this.configService.get<string> ("app.name"), }, }),
                start_greeting: this.i18nService.t ("_v1_user.common.start_greeting", { args: { name: event.name, }, }),
                line1: this.i18nService.t ("_v1_user.account_email_change.line1"),
                line2: this.i18nService.t ("_v1_user.account_email_change.line2"),
                verify: this.i18nService.t ("_v1_user.account_email_change.verify"),
                title: this.i18nService.t ("_v1_user.account_email_change.subject"),
                user_name: event.name,
                user_email: event.email,
                link: this.urlHelper.ref ().sign (`${this.configService.get<string> ("app.frontendUrl")}/auth/verify-email/${event.email}`),
            },
        });
    }
}
