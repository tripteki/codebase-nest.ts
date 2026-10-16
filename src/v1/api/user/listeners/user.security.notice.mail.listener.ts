import { OnEvent, } from "@nestjs/event-emitter";
import { AppMailNotificationListener, } from "src/app/listeners/app.mail.notification.listener";
import { UserSecurityNoticeEvent, } from "src/v1/api/user/events/user.security.notice.event";

/**
 * @class {UserSecurityNoticeMailListener}
 * @extends {AppMailNotificationListener}
 */
export class UserSecurityNoticeMailListener extends AppMailNotificationListener
{
    @OnEvent ("v1.user.security.notice")
    /**
     * @param {UserSecurityNoticeEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: UserSecurityNoticeEvent): Promise<void>
    {
        await this.sendMail ({
            template: __dirname + "/../views/user.security.notice.mail.hbs",
            to: event.to,
            subject: event.subject,
            context: {
                close_greeting: this.i18nService.t ("_v1_user.common.close_greeting", { args: { appName: this.configService.get<string> ("app.name"), }, }),
                start_greeting: this.i18nService.t ("_v1_user.common.start_greeting", { args: { name: event.name, }, }),
                line1: event.line1,
                line2: event.line2,
                link: event.link,
                link_label: event.linkLabel,
                title: event.subject,
                user_name: event.name,
                user_email: event.to,
            },
        });
    }
}
