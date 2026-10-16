import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { EventEmitter2 as EventListenerService, } from "@nestjs/event-emitter";
import { I18nService, } from "nestjs-i18n";
import { User, } from "@prisma/client";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { UserSecurityNoticeEvent, } from "src/v1/api/user/events/user.security.notice.event";
import { UserProfileRepository, } from "src/v1/api/user/repositories/user.profile.repository";

@Injectable ()
/**
 * @class {SecurityNotifier}
 */
export class SecurityNotifier
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {EventListenerService} eventListenerService
     * @param {DateTimeHelper} dateTimeHelper
     * @param {UserProfileRepository} userProfileRepository
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly eventListenerService: EventListenerService,
        protected readonly dateTimeHelper: DateTimeHelper,
        protected readonly userProfileRepository: UserProfileRepository
    )
    {
        //
    }

    /**
     * @param {string} email
     * @returns {string}
     */
    public maskEmail (email: string): string
    {
        const [ local, domain, ] = (email || "").split ("@");
        const visible = local && local.length > 2 ? local.slice (0, 2) : (local || "").slice (0, 1);

        return domain ? `${visible}***@${domain}` : `${visible}***`;
    }

    /**
     * @param {string} userId
     * @param {string} fallback
     * @returns {Promise<string>}
     */
    public async displayName (userId: string, fallback: string): Promise<string>
    {
        const current = await this.userProfileRepository.getMe (userId);

        return current?.profile?.full_name || fallback;
    }

    /**
     * @param {UserSecurityNoticeEvent} event
     * @returns {void}
     */
    protected send (event: UserSecurityNoticeEvent): void
    {
        this.eventListenerService.emit ("v1.user.security.notice", event);
    }

    /**
     * @param {User} user
     * @param {string | null} actorId
     * @returns {Promise<void>}
     */
    public async passwordChanged (user: User, actorId?: string | null): Promise<void>
    {
        if (user.deleted_at) return;

        const time = this.dateTimeHelper.nowString ();
        const line1 = actorId && actorId !== user.id
            ? this.i18nService.t ("_v1_user.security.password_line_admin", {
                args: { admin: await this.displayName (actorId, "-"), time, },
            })
            : this.i18nService.t ("_v1_user.security.password_line_self", { args: { time, }, });
        const frontendUrl = (this.configService.get<string> ("app.frontendUrl") || "").replace (/\/$/, "");

        this.send (new UserSecurityNoticeEvent ({
            to: user.email,
            name: await this.displayName (user.id, user.email),
            subject: this.i18nService.t ("_v1_user.security.password_subject"),
            line1,
            line2: this.i18nService.t ("_v1_user.security.password_warning"),
            link: `${frontendUrl}/login`,
            linkLabel: this.i18nService.t ("_v1_user.security.login"),
        }));
    }

    /**
     * @param {User} user
     * @param {string} oldEmail
     * @param {boolean} byAdmin
     * @returns {Promise<void>}
     */
    public async emailChanged (user: User, oldEmail: string, byAdmin: boolean): Promise<void>
    {
        if (user.deleted_at || ! oldEmail || oldEmail.toLowerCase () === user.email.toLowerCase ()) return;

        const name = await this.displayName (user.id, user.email);
        const frontendUrl = (this.configService.get<string> ("app.frontendUrl") || "").replace (/\/$/, "");

        this.send (new UserSecurityNoticeEvent ({
            to: oldEmail,
            name,
            subject: this.i18nService.t ("_v1_user.security.email_old_subject"),
            line1: this.i18nService.t ("_v1_user.security.email_old_line", {
                args: { email: this.maskEmail (user.email), },
            }),
            line2: this.i18nService.t ("_v1_user.security.email_old_warning"),
        }));

        if (byAdmin) {
            this.send (new UserSecurityNoticeEvent ({
                to: user.email,
                name,
                subject: this.i18nService.t ("_v1_user.security.email_new_subject"),
                line1: this.i18nService.t ("_v1_user.security.email_new_line"),
                link: `${frontendUrl}/login`,
                linkLabel: this.i18nService.t ("_v1_user.security.login"),
            }));
        }
    }
}
