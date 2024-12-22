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
        this.mailService.sendMail ({

            template: "mail",

            to: event.email,
            subject: this.i18nService.t ("_module_v1_user.account_deactivated.subject"),
            context: {
                greeting: this.i18nService.t ("_module_v1_user.account_deactivated.greeting", { args: { name: event.name, }, }),
                line: this.i18nService.t ("_module_v1_user.account_deactivated.line"),
                thank_you: this.i18nService.t ("_module_v1_user.account_deactivated.thank_you"),
            },
        });
    }
}
