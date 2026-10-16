import { OnEvent, } from "@nestjs/event-emitter";
import { AppMailNotificationListener, } from "src/app/listeners/app.mail.notification.listener";
import { UserAdminCreatedEvent, } from "src/v1/api/user/events/user.admin.created.event";

/**
 * @class {UserAdminCreatedMailListener}
 * @extends {AppMailNotificationListener}
 */
export class UserAdminCreatedMailListener extends AppMailNotificationListener
{
    @OnEvent ("v1.user.admin.created")
    /**
     * @param {UserAdminCreatedEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: UserAdminCreatedEvent): Promise<void>
    {
        const frontendUrl = (this.configService.get<string> ("app.frontendUrl") || "").replace (/\/$/, "");

        await this.sendMail ({
            template: __dirname + "/../views/user.admin.created.mail.hbs",
            to: event.email,
            subject: this.i18nService.t ("_v1_user.account_created.subject"),
            context: {
                close_greeting: this.i18nService.t ("_v1_user.common.close_greeting", { args: { appName: this.configService.get<string> ("app.name"), }, }),
                start_greeting: this.i18nService.t ("_v1_user.common.start_greeting", { args: { name: event.name, }, }),
                line1: this.i18nService.t ("_v1_user.account_created.line1", { args: { role: event.roleLabel, }, }),
                line2: this.i18nService.t ("_v1_user.account_created.line2"),
                login: this.i18nService.t ("_v1_user.account_created.login"),
                forgot: this.i18nService.t ("_v1_user.account_created.forgot"),
                title: this.i18nService.t ("_v1_user.account_created.subject"),
                user_name: event.name,
                user_email: event.email,
                login_link: `${frontendUrl}/login`,
                forgot_link: `${frontendUrl}/forgot-password`,
            },
        });
    }
}
