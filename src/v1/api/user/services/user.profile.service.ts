import { randomUUID, } from "crypto";
import { BadRequestException, HttpException, Injectable, Inject, UnprocessableEntityException, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { CACHE_MANAGER, Cache as CacheService, } from "@nestjs/cache-manager";
import { I18nService, } from "nestjs-i18n";
import { EventEmitter2 as EventListenerService, } from "@nestjs/event-emitter";
import { plainToClass, } from "class-transformer";
import { unprocessableDetail, } from "src/app/http/app.validation.response";
import { AppService, } from "src/app/services/app.service";
import { HasherHelper, } from "src/app/helpers/hasher.helper";
import { UserAuthRepository, } from "src/v1/api/user/repositories/user.auth.repository";
import { UserProfileRepository, } from "src/v1/api/user/repositories/user.profile.repository";
import { UserAclRepository, } from "src/v1/api/user/repositories/user.acl.repository";
import {
    UserAccessTransformerDto,
    UserMeTransformerDto,
    UserProfileTransformerDto,
} from "src/v1/api/user/dtos/user.transformer.dto";
import { UserMeUpdateValidatorDto, } from "src/v1/api/user/dtos/user.validator.dto";
import { UserAuthRegisteredEvent, } from "src/v1/api/user/events/user.auth.registered.event";
import { SecurityNotifier, } from "src/v1/api/user/support/security.notifier";
import { Profile, User, } from "@prisma/client";

@Injectable ()
/**
 * @class {UserProfileService}
 * @extends {AppService}
 */
export class UserProfileService extends AppService
{
    /**
     * @param {ConfigService} configService
     * @param {HasherHelper} hasherHelper
     * @param {UserProfileRepository} userProfileRepository
     * @param {UserAclRepository} userAclRepository
     * @param {EventListenerService} eventListenerService
     * @param {SecurityNotifier} securityNotifier
     * @param {I18nService} i18nService
     * @param {UserAuthRepository} userAuthRepository
     * @param {CacheService} cacheService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly hasherHelper: HasherHelper,
        protected readonly userProfileRepository: UserProfileRepository,
        protected readonly userAclRepository: UserAclRepository,
        protected readonly eventListenerService: EventListenerService,
        protected readonly securityNotifier: SecurityNotifier,
        protected readonly i18nService: I18nService,
        protected readonly userAuthRepository: UserAuthRepository,
        @Inject (CACHE_MANAGER) protected readonly cacheService: CacheService
    )
    {
        super ();
    }

    /**
     * @param {string} userId
     * @returns {Promise<UserMeTransformerDto | string>}
     */
    public async getMe (
        userId: string
    ): Promise<UserMeTransformerDto | string>
    {
        try {
            const result = await this.userProfileRepository.getMe (userId);

            if (! result) {
                return "User not found";
            }

            return this.toMeDto (result.user, result.profile);
        } catch (error: any) {
            return error.message;
        }
    }

    /**
     * @param {string} userId
     * @param {UserMeUpdateValidatorDto} data
     * @param {string | null | undefined} avatarPath
     * @returns {Promise<UserMeTransformerDto | string>}
     */
    public async updateMe (
        userId: string,
        data: UserMeUpdateValidatorDto,
        avatarPath?: string | null
    ): Promise<UserMeTransformerDto | string>
    {
        try {
            if (data.password && data.password !== (data.password_confirmation ?? "")) {
                throw new UnprocessableEntityException (unprocessableDetail (this.i18nService.t ("_v1_user.auth.password_mismatch"), data));
            }

            const current = await this.userProfileRepository.getMe (userId);

            if (! current) return "User not found";

            const nextEmail = data.email.trim ();
            const emailChanged = nextEmail.toLowerCase () !== current.user.email.toLowerCase ();

            if (emailChanged) {
                if (await this.userAuthRepository.emailTaken (nextEmail, userId)) {
                    throw new BadRequestException (this.i18nService.t ("_v1_user.auth.email_already_exists"));
                }

                const displayName = (data.full_name || data.name || current.user.email || "").trim ();

                await this.requestEmailChange (current.user, nextEmail, displayName);
            }

            const nextName = (data.name || "").trim ();

            if (nextName && nextName !== (current.user.name || "")) {
                if (await this.userAuthRepository.nameTaken (nextName, userId)) {
                    throw new BadRequestException (this.i18nService.t ("_v1_user.auth.name_already_exists"));
                }
            }

            const userData: Record<string, unknown> = {
                name: data.name,
            };

            if (data.password) {
                userData.password = await this.hasherHelper.hash (data.password);
            }

            const profileData: Record<string, unknown> = {
                full_name: data.full_name ?? null,
                interests: (data.interests ?? [])
                    .map ((value) => String (value).trim ())
                    .filter ((value) => value.length > 0),
            };

            const result = await this.userProfileRepository.updateMe (
                userId,
                userData,
                profileData,
                avatarPath
            );

            if (! result) {
                return "User not found";
            }

            if (data.password) await this.securityNotifier.passwordChanged (result.user, result.user.id);

            this.eventListenerService.emit ("v1.admin.refresh", {
                subjectType: "User",
                causerId: userId,
            });

            return this.toMeDto (result.user, result.profile);
        } catch (error: any) {
            if (error instanceof HttpException) throw error;

            return error.message;
        }
    }

    /**
     * @param {User} user
     * @param {string} newEmail
     * @param {string} displayName
     * @returns {Promise<void>}
     */
    protected async requestEmailChange (user: User, newEmail: string, displayName: string): Promise<void>
    {
        const token = randomUUID ();

        await this.cacheService.set (`email-change:${newEmail.toLowerCase ()}`, JSON.stringify ({
            user_id: user.id,
            token,
        }), 3600 * 1000);

        this.eventListenerService.emit ("v1.user.profile.email-change", new UserAuthRegisteredEvent ({
            id: user.id,
            name: displayName || user.email,
            email: newEmail,
            email_verified_at: user.email_verified_at,
            created_at: user.created_at,
            updated_at: user.updated_at,
            deleted_at: user.deleted_at,
            token,
        }));
    }

    /**
     * @returns {Promise<string[]>}
     */
    public async profileInterests (): Promise<string[]>
    {
        return await this.userProfileRepository.profileInterests ();
    }

    /**
     * @param {string} userId
     * @returns {Promise<UserAccessTransformerDto>}
     */
    public async accesses (
        userId: string
    ): Promise<UserAccessTransformerDto>
    {
        const result = await this.userAclRepository.getUserAccesses (userId);

        return plainToClass (UserAccessTransformerDto, result);
    }

    /**
     * @param {User} user
     * @param {Profile | null} profile
     * @returns {UserMeTransformerDto}
     */
    protected toMeDto (
        user: User,
        profile: Profile | null
    ): UserMeTransformerDto
    {
        const appUrl: string = this.configService.get<string> ("app.frontendUrl") ?? "";
        let avatarUrl: string | null = null;

        if (profile?.avatar) {
            avatarUrl = `${appUrl.replace (/\/$/, "")}/storage/${profile.avatar.replace (/^\//, "")}`;
        }

        return plainToClass (UserMeTransformerDto, {
            id: user.id,
            name: user.name,
            email: user.email,
            email_verified_at: user.email_verified_at,
            created_at: user.created_at,
            updated_at: user.updated_at,
            profile: profile
                ? plainToClass (UserProfileTransformerDto, {
                    full_name: profile.full_name,
                    avatar: profile.avatar,
                    avatar_url: avatarUrl,
                    interests: Array.isArray (profile.interests)
                        ? profile.interests
                        : [],
                })
                : null,
        });
    }
}
