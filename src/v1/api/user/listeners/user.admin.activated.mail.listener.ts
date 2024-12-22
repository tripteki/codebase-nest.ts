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
        this.mailService.sendMail ({

            template: "mail",

            to: event.email,
            subject: this.i18nService.t ("_module_v1_user.account_activated.subject"),
            context: {
                greeting: this.i18nService.t ("_module_v1_user.account_activated.greeting", { args: { name: event.name, }, }),
                line: this.i18nService.t ("_module_v1_user.account_activated.line"),
                thank_you: this.i18nService.t ("_module_v1_user.account_activated.thank_you"),
            },
        });
    }
}
