import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { plainToClass, } from "class-transformer";
import { AppService, } from "src/app/services/app.service";
import { HasherHelper, } from "src/app/helpers/hasher.helper";
import { UserProfileRepository, } from "src/v1/api/user/repositories/user.profile.repository";
import { UserAclRepository, } from "src/v1/api/user/repositories/user.acl.repository";
import {
    UserAccessTransformerDto,
    UserMeTransformerDto,
    UserProfileTransformerDto,
} from "src/v1/api/user/dtos/user.transformer.dto";
import { UserMeUpdateValidatorDto, } from "src/v1/api/user/dtos/user.validator.dto";
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
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly hasherHelper: HasherHelper,
        protected readonly userProfileRepository: UserProfileRepository,
        protected readonly userAclRepository: UserAclRepository
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
                return "Password and password confirmation must match";
            }

            const userData: Record<string, unknown> = {
                name: data.name,
                email: data.email,
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

            return this.toMeDto (result.user, result.profile);
        } catch (error: any) {
            return error.message;
        }
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
        const appUrl: string = this.configService.get<string> ("app.url") ?? "";
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
