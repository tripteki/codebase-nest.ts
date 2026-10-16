import { OnEvent, } from "@nestjs/event-emitter";
import { Injectable, } from "@nestjs/common";
import { I18nService, } from "nestjs-i18n";
import { userRoleNotify, } from "src/v1/api/user/dtos/user.role.enum";
import { UserAclRepository, } from "src/v1/api/user/repositories/user.acl.repository";
import { UserProfileRepository, } from "src/v1/api/user/repositories/user.profile.repository";
import { AccountNotifier, } from "src/v1/api/user/support/account.notifier";

/**
 * @class {UserRegistrationVerifiedListener}
 */
@Injectable ()
export class UserRegistrationVerifiedListener
{
    /**
     * @param {I18nService} i18nService
     * @param {AccountNotifier} accountNotifier
     * @param {UserAclRepository} userAclRepository
     * @param {UserProfileRepository} userProfileRepository
     * @returns {void}
     */
    constructor (
        protected readonly i18nService: I18nService,
        protected readonly accountNotifier: AccountNotifier,
        protected readonly userAclRepository: UserAclRepository,
        protected readonly userProfileRepository: UserProfileRepository
    )
    {
        //
    }

    @OnEvent ("v1.user.registration.verified")
    /**
     * @param {{ id: string; actorId?: string | null; }} event
     * @returns {Promise<void>}
     */
    public async handle (event: { id: string; actorId?: string | null; }): Promise<void>
    {
        const current = await this.userProfileRepository.getMe (event.id);

        if (! current) return;

        const role = await this.userAclRepository.getUserRole (event.id);
        const roleLabel = role ? this.i18nService.t (`_v1_user.roles.${role}`) : "-";
        const fullName = current.profile?.full_name || current.user.name || "-";

        if (event.id !== event.actorId) {
            await this.accountNotifier.notify (event.id, "user.registration.verified", {
                title: this.i18nService.t ("_v1_user.registration.verified_title"),
                body: this.i18nService.t ("_v1_user.registration.verified_body"),
                url: "/admin/dashboard",
            });
        }

        const staffIds = await this.userAclRepository.findUserIdsByRoleNames (userRoleNotify ());
        const body = this.i18nService.t ("_v1_user.registration.new_body", {
            args: { full_name: fullName, email: current.user.email, role: roleLabel, },
        });

        for (const staffId of staffIds) {
            if (staffId === event.id || staffId === event.actorId) continue;

            await this.accountNotifier.notify (staffId, "user.registration.new", {
                title: this.i18nService.t ("_v1_user.registration.new_title"),
                body,
                url: `/admin/users/${event.id}`,
                user_id: event.id,
            });
        }
    }
}
