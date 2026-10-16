import { BadRequestException, ForbiddenException, HttpException, Injectable, NotFoundException, UnprocessableEntityException, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { EventEmitter2 as EventListenerService, } from "@nestjs/event-emitter";
import { I18nService, } from "nestjs-i18n";
import { InjectQueue, } from "@nestjs/bull";
import { AppService, } from "src/app/services/app.service";
import { OffsetPaginationType, CursorPaginationType, OffsetPagination, CursorPagination, Orderization, Filterization, } from "src/app/repositories/app.repository";
import { UserAdminActivatedEvent, } from "src/v1/api/user/events/user.admin.activated.event";
import { UserAdminDeactivatedEvent, } from "src/v1/api/user/events/user.admin.deactivated.event";
import { ActivityRecorder, } from "src/v1/api/log/support/activity.recorder";
import { UserRoleEnum, userRolePrivileged, } from "src/v1/api/user/dtos/user.role.enum";
import { UserAclRepository, } from "src/v1/api/user/repositories/user.acl.repository";
import { UserAdminRepository, } from "src/v1/api/user/repositories/user.admin.repository";
import { UserAuthRepository, } from "src/v1/api/user/repositories/user.auth.repository";
import { AccountNotifier, } from "src/v1/api/user/support/account.notifier";
import { SecurityNotifier, } from "src/v1/api/user/support/security.notifier";
import { UserAuthIdentifierTransformerDto, UserTransformerDto, } from "src/v1/api/user/dtos/user.transformer.dto";
import { UserIdentifierDto, UserUpdateValidatorDto, UserCreateValidatorDto, } from "src/v1/api/user/dtos/user.validator.dto";
import { Queue, } from "bull";
import { plainToClass, } from "class-transformer";
import { unprocessableDetail, } from "src/app/http/app.validation.response";

@Injectable ()
/**
 * @class {UserAdminService}
 * @extends {AppService}
 */
export class UserAdminService extends AppService
{
    /**
     * @param {ConfigService} configService
     * @param {EventListenerService} eventListenerService
     * @param {I18nService} i18nService
     * @param {Queue} userAdminQueue
     * @param {UserAdminRepository} userAdminRepository
     * @param {UserAuthRepository} userAuthRepository
     * @param {UserAclRepository} userAclRepository
     * @param {ActivityRecorder} activityRecorder
     * @param {AccountNotifier} accountNotifier
     * @param {SecurityNotifier} securityNotifier
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly eventListenerService: EventListenerService,
        protected readonly i18nService: I18nService,
        @InjectQueue ("user-admin-queue") protected readonly userAdminQueue: Queue,
        protected readonly userAdminRepository: UserAdminRepository,
        protected readonly userAuthRepository: UserAuthRepository,
        protected readonly userAclRepository: UserAclRepository,
        protected readonly activityRecorder: ActivityRecorder,
        protected readonly accountNotifier: AccountNotifier,
        protected readonly securityNotifier: SecurityNotifier
    )
    {
        super ();
    }

    /**
     * @param {any} error
     * @returns {string}
     */
    protected failure (error: any): string
    {
        if (error instanceof HttpException) throw error;

        return error.message;
    }

    /**
     * @param {string} actorId
     * @param {string} targetId
     * @returns {Promise<void>}
     */
    protected async assertCanMutate (actorId: string, targetId: string): Promise<void>
    {
        if (actorId === targetId) {
            throw new ForbiddenException (this.i18nService.t ("_v1_user.auth.account_locked"));
        }

        const actorRole = await this.userAclRepository.getUserRole (actorId);
        const targetRole = await this.userAclRepository.getUserRole (targetId);

        if (targetRole && userRolePrivileged ().includes (targetRole as UserRoleEnum) && actorRole !== UserRoleEnum.Superadmin) {
            throw new ForbiddenException (this.i18nService.t ("_v1_user.auth.account_locked"));
        }
    }

    /**
     * @param {string} actorId
     * @param {UserRoleEnum} roleName
     * @param {string} targetId
     * @returns {Promise<void>}
     */
    protected async assertCanAssign (actorId: string, roleName: UserRoleEnum, targetId?: string): Promise<void>
    {
        const actorRole = await this.userAclRepository.getUserRole (actorId);

        if (actorRole !== UserRoleEnum.Superadmin && roleName !== UserRoleEnum.User) {
            throw new ForbiddenException (this.i18nService.t ("_v1_user.auth.role_forbidden"));
        }

        if (targetId && targetId === actorId) {
            const currentRole = await this.userAclRepository.getUserRole (targetId);

            if (currentRole !== roleName) {
                throw new ForbiddenException (this.i18nService.t ("_v1_user.auth.role_self_forbidden"));
            }
        }

        if (targetId) await this.assertCanMutate (actorId, targetId);
    }

    /**
     * @param {string | null} avatar
     * @returns {string | null}
     */
    protected avatarUrl (avatar?: string | null): string | null
    {
        if (! avatar) {
            return null;
        }

        const frontend = String (this.configService.get<string> ("app.frontendUrl") || "").replace (/\/$/, "");
        const path = String (avatar).replace (/^\//, "");

        return frontend ? `${frontend}/storage/${path}` : `/storage/${path}`;
    }

    /**
     * @param {Record<string, any>} user
     * @param {{ full_name?: string | null; avatar?: string | null } | null} profile
     * @param {string | null} role
     * @returns {UserTransformerDto}
     */
    protected toAdminDto (
        user: Record<string, any>,
        profile: { full_name?: string | null; avatar?: string | null } | null,
        role: string | null
    ): UserTransformerDto
    {
        const avatar = profile?.avatar ?? null;

        const safe = { ...(user || {}), };
        delete safe.password;
        delete safe.profile;

        return plainToClass (UserTransformerDto, {
            ... safe,
            role,
            full_name: profile?.full_name ?? null,
            avatar,
            avatar_url: this.avatarUrl (avatar),
        });
    }

    /**
     * @param {Record<string, any>} user
     * @returns {Promise<UserTransformerDto>}
     */
    protected async withRole (user: Record<string, any>): Promise<UserTransformerDto>
    {
        const role = user?.id ? await this.userAclRepository.getUserRole (user.id) : null;
        const profile = user?.id ? await this.userAdminRepository.findProfile (user.id) : null;

        return this.toAdminDto (user, profile, role);
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {Orderization<UserTransformerDto>[]} orders
     * @param {Filterization<UserTransformerDto>[]} filters
     * @param {OffsetPaginationType} page
     * @returns {Promise<OffsetPagination<UserTransformerDto>>}
     */
    public async all (
        { userId, }: UserAuthIdentifierTransformerDto,
        orders: Orderization<UserTransformerDto>[],
        filters: Filterization<UserTransformerDto>[],
        page: OffsetPaginationType
    ): Promise<OffsetPagination<UserTransformerDto>>
    {
        const dto: OffsetPagination<UserTransformerDto> = await this.userAdminRepository.allOffset (
            userId,
            orders,
            filters,
            page
        );
        const roles = await this.userAclRepository.getRolesByUserIds (dto.data.map ((user) => user.id));

        return {
            ... dto,
            data: dto.data.map ((user) => this.toAdminDto (
                user as unknown as Record<string, any>,
                (user as unknown as { profile?: { full_name?: string | null; avatar?: string | null } | null, }).profile ?? null,
                roles[user.id] ?? null
            )),
        };
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {UserIdentifierDto} id
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async get (
        { userId, }: UserAuthIdentifierTransformerDto,
        { id, }: UserIdentifierDto
    ): Promise<UserTransformerDto | string>
    {
        try {

            try {

                return this.withRole (await this.userAdminRepository.get (
                    userId,
                    id
                ) as never);

            } catch (error: any) {

                const existing = await this.userAdminRepository.findIncludingDeleted (id);

                if (! existing) return this.failure (error);

                return this.withRole (existing as never);
            }

        } catch (error: any) {

            return this.failure (error);
        }
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {UserIdentifierDto} id
     * @param {UserUpdateValidatorDto} data
     * @param {string | undefined} avatarPath
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async update (
        { userId, }: UserAuthIdentifierTransformerDto,
        { id, }: UserIdentifierDto,
        data: UserUpdateValidatorDto,
        avatarPath?: string
    ): Promise<UserTransformerDto | string>
    {
        if (data.password || data.password_confirmation) {
            if (! data.password) {
                throw new UnprocessableEntityException (unprocessableDetail (this.i18nService.t ("_v1_user.auth.password_required"), data));
            }

            if (! data.password_confirmation) {
                throw new UnprocessableEntityException (unprocessableDetail (this.i18nService.t ("_v1_user.auth.password_confirmation_required"), data));
            }

            if (data.password !== data.password_confirmation) {
                throw new UnprocessableEntityException (unprocessableDetail (this.i18nService.t ("_v1_user.auth.password_mismatch"), data));
            }
        }

        try {

            await this.assertCanMutate (userId, id);

            if (data.role) await this.assertCanAssign (userId, data.role, id);

            if (data.email && await this.userAuthRepository.emailTaken (data.email, id)) {
                throw new BadRequestException (this.i18nService.t ("_v1_user.auth.email_already_exists"));
            }

            const nextName = (data.full_name || data.name || "").trim ();

            if (nextName && await this.userAuthRepository.nameTaken (nextName, id)) {
                throw new BadRequestException (this.i18nService.t ("_v1_user.auth.name_already_exists"));
            }

            const previous = await this.userAdminRepository.get (userId, id);
            const previousRole = await this.userAclRepository.getUserRole (id);
            const displayName = data.full_name || data.name;

            const updated = await this.userAdminRepository.update (
                userId,
                id,
                displayName ? { ... data, name: displayName, } : data
            );

            if (updated && (displayName || data.full_name || avatarPath)) {
                await this.userAdminRepository.upsertDisplay (updated.id, displayName || undefined, avatarPath);
            }

            if (data.role && updated) await this.userAclRepository.assignSingleRole (updated.id, data.role);

            if (updated) {
                const attributes: Record<string, string> = {};

                if (displayName) attributes.full_name = displayName;
                if (data.email) attributes.email = data.email;
                if (data.role) attributes.role = data.role;

                if (Object.keys (attributes).length > 0) {
                    await this.activityRecorder.log ("user updated", "updated", "User", updated.id, userId, {
                        attributes,
                    });
                }

                if (previous && data.email && data.email.toLowerCase () !== previous.email.toLowerCase ()) {
                    await this.securityNotifier.emailChanged (updated, previous.email, true);
                }

                if (data.password) await this.securityNotifier.passwordChanged (updated, userId);

                if (data.role && data.role !== previousRole) await this.accountNotifier.roleChanged (updated, data.role);
            }

            return updated ? this.withRole (updated as never) : updated;

        } catch (error: any) {

            return this.failure (error);
        }
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {UserCreateValidatorDto} data
     * @param {string | undefined} avatarPath
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async create (
        { userId, }: UserAuthIdentifierTransformerDto,
        data: UserCreateValidatorDto,
        avatarPath?: string
    ): Promise<UserTransformerDto | string>
    {
        if (data.password !== data.password_confirmation) {
            throw new UnprocessableEntityException (unprocessableDetail (this.i18nService.t ("_v1_user.auth.password_mismatch"), data));
        }

        try {

            const roleName = data.role || UserRoleEnum.User;
            const displayName = (data.full_name || data.name || "").trim ();

            await this.assertCanAssign (userId, roleName);

            if (await this.userAuthRepository.emailTaken (data.email)) {
                throw new BadRequestException (this.i18nService.t ("_v1_user.auth.email_already_exists"));
            }

            if (displayName && await this.userAuthRepository.nameTaken (displayName)) {
                throw new BadRequestException (this.i18nService.t ("_v1_user.auth.name_already_exists"));
            }

            const created = await this.userAdminRepository.create (
                userId,
                { ... data, name: displayName, }
            );

            if (created) {
                await this.userAdminRepository.upsertDisplay (created.id, displayName, avatarPath);
                await this.userAclRepository.assignSingleRole (created.id, roleName);
                await this.activityRecorder.log ("user created", "created", "User", created.id, userId, {
                    attributes: {
                        full_name: displayName,
                        email: created.email,
                        role: roleName,
                    },
                });
                await this.accountNotifier.accountCreated (created, roleName);
            }

            return created ? this.withRole (created as never) : created;

        } catch (error: any) {

            return this.failure (error);
        }
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {UserIdentifierDto} id
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async restore (
        { userId, }: UserAuthIdentifierTransformerDto,
        { id, }: UserIdentifierDto
    ): Promise<UserTransformerDto | string>
    {
        try {

            await this.assertCanMutate (userId, id);

            const restored = await this.userAdminRepository.restore (
                userId,
                id
            );
            const dto = restored ? await this.withRole (restored as never) : restored;

            if (dto) {
                const named = dto as UserTransformerDto;
                this.eventListenerService.emit ("v1.user.admin.activated", new UserAdminActivatedEvent ({
                    ... named,
                    name: (named.full_name || named.name || named.email || "").trim (),
                }));
                await this.activityRecorder.log ("user activated", "activated", "User", dto.id, userId, {});
            }

            return dto;

        } catch (error: any) {

            return this.failure (error);
        }
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {UserIdentifierDto} id
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async delete (
        { userId, }: UserAuthIdentifierTransformerDto,
        { id, }: UserIdentifierDto
    ): Promise<UserTransformerDto | string>
    {
        try {

            await this.assertCanMutate (userId, id);

            const deleted = await this.userAdminRepository.delete (
                userId,
                id
            );
            const dto = deleted ? await this.withRole (deleted as never) : deleted;

            if (dto) {
                const named = dto as UserTransformerDto;
                this.eventListenerService.emit ("v1.user.admin.deactivated", new UserAdminDeactivatedEvent ({
                    ... named,
                    name: (named.full_name || named.name || named.email || "").trim (),
                }));
                await this.activityRecorder.log ("user deactivated", "deactivated", "User", dto.id, userId, {});
            }

            return dto;

        } catch (error: any) {

            return this.failure (error);
        }
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {UserIdentifierDto} id
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async forceDelete (
        { userId, }: UserAuthIdentifierTransformerDto,
        { id, }: UserIdentifierDto
    ): Promise<UserTransformerDto | string>
    {
        try {

            await this.assertCanMutate (userId, id);

            const existing = await this.userAdminRepository.findIncludingDeleted (id);

            if (! existing) {
                throw new NotFoundException (this.i18nService.t ("_v1_user.auth.user_not_found"));
            }

            const dto = await this.withRole (existing as never);
            const deleted = await this.userAdminRepository.forceDelete (id);

            if (! deleted) {
                throw new NotFoundException (this.i18nService.t ("_v1_user.auth.user_not_found"));
            }

            await this.activityRecorder.log ("user force deleted", "deleted", "User", existing.id, userId, {
                attributes: { email: existing.email, },
            });

            return dto;

        } catch (error: any) {

            return this.failure (error);
        }
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {UserIdentifierDto} id
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async verify (
        { userId, }: UserAuthIdentifierTransformerDto,
        { id, }: UserIdentifierDto
    ): Promise<UserTransformerDto | string>
    {
        try {

            await this.assertCanMutate (userId, id);

            const current = await this.userAdminRepository.get (userId, id);

            if (current?.email_verified_at) return this.withRole (current as never);

            const verified = await this.userAdminRepository.verify (
                userId,
                id
            );

            if (verified) {
                await this.activityRecorder.log ("user verified", "verified", "User", verified.id, userId, {});
                this.eventListenerService.emit ("v1.user.registration.verified", { id: verified.id, actorId: userId, });
            }

            return verified ? this.withRole (verified as never) : verified;

        } catch (error: any) {

            return this.failure (error);
        }
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {string} file
     * @returns {Promise<string>}
     */
    public async import (
        { userId, }: UserAuthIdentifierTransformerDto,
        file: string
    ): Promise<string>
    {
        await this.userAdminQueue.add ("import", { userId, file, });

        return this.i18nService.t ("_v1_user.import.started.message");
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {string} type
     * @param {Orderization<UserTransformerDto>[]} orders
     * @param {Filterization<UserTransformerDto>[]} filters
     * @returns {Promise<string>}
     */
    public async export (
        { userId, }: UserAuthIdentifierTransformerDto,
        type: string = "csv",
        orders: Orderization<UserTransformerDto>[] = [],
        filters: Filterization<UserTransformerDto>[] = []
    ): Promise<string>
    {
        const validTypes = [ "csv", "xls", "xlsx", ];
        const normalizedType = validTypes.includes (type.toLowerCase ()) ? type.toLowerCase () : "csv";

        await this.userAdminQueue.add ("export", { userId, type: normalizedType, orders, filters, });

        return this.i18nService.t ("_v1_user.export.started.message");
    }
}
