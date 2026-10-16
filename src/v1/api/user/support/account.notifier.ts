import { Injectable, } from "@nestjs/common";
import { EventEmitter2 as EventListenerService, } from "@nestjs/event-emitter";
import { I18nService, } from "nestjs-i18n";
import { User, } from "@prisma/client";
import { NotificationCreateValidatorDto, } from "src/v1/api/notification/dtos/notification.validator.dto";
import { NotificationUserService, } from "src/v1/api/notification/services/notification.user.service";
import { UserAdminCreatedEvent, } from "src/v1/api/user/events/user.admin.created.event";
import { UserProfileRepository, } from "src/v1/api/user/repositories/user.profile.repository";

@Injectable ()
/**
 * @class {AccountNotifier}
 */
export class AccountNotifier
{
    /**
     * @param {I18nService} i18nService
     * @param {EventListenerService} eventListenerService
     * @param {NotificationUserService} notificationUserService
     * @param {UserProfileRepository} userProfileRepository
     * @returns {void}
     */
    constructor (
        protected readonly i18nService: I18nService,
        protected readonly eventListenerService: EventListenerService,
        protected readonly notificationUserService: NotificationUserService,
        protected readonly userProfileRepository: UserProfileRepository
    )
    {
        //
    }

    /**
     * @param {string} recipientId
     * @param {string} type
     * @param {Record<string, string>} data
     * @returns {Promise<void>}
     */
    public async notify (recipientId: string, type: string, data: Record<string, string>): Promise<void>
    {
        const current = await this.userProfileRepository.getMe (recipientId);

        if (! current || current.user.deleted_at) return;

        await this.notificationUserService.notify (
            { userId: recipientId, },
            {
                type,
                data,
            } as unknown as NotificationCreateValidatorDto
        );
    }

    /**
     * @param {User} user
     * @returns {Promise<string>}
     */
    public async displayName (user: User): Promise<string>
    {
        const current = await this.userProfileRepository.getMe (user.id);

        return current?.profile?.full_name || user.name || user.email;
    }

    /**
     * @param {User} user
     * @param {string} role
     * @returns {Promise<void>}
     */
    public async accountCreated (user: User, role: string): Promise<void>
    {
        const roleLabel = this.i18nService.t (`_v1_user.roles.${role}`);

        await this.notify (user.id, "user.account.created", {
            title: this.i18nService.t ("_v1_user.account_created.title"),
            body: this.i18nService.t ("_v1_user.account_created.body", { args: { role: roleLabel, }, }),
            url: "/admin/dashboard",
        });

        this.eventListenerService.emit ("v1.user.admin.created", new UserAdminCreatedEvent ({
            id: user.id,
            name: await this.displayName (user),
            email: user.email,
            roleLabel: roleLabel,
        }));
    }

    /**
     * @param {User} user
     * @param {string} role
     * @returns {Promise<void>}
     */
    public async roleChanged (user: User, role: string): Promise<void>
    {
        const roleLabel = this.i18nService.t (`_v1_user.roles.${role}`);

        await this.notify (user.id, "user.role.changed", {
            title: this.i18nService.t ("_v1_user.role_changed.title"),
            body: this.i18nService.t ("_v1_user.role_changed.body", { args: { role: roleLabel, }, }),
            url: "/admin/dashboard",
        });
    }
}
