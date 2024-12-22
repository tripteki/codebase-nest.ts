import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { Profile, User, } from "@prisma/client";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { AppPostgreRepository, } from "src/app/repositories/app.postgre.repository";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { unlink } from "fs/promises";
import { join, } from "path";
import { ulid, } from "ulid";

@Injectable ()
/**
 * @class {UserProfileRepository}
 * @extends {AppPostgreRepository}
 */
export class UserProfileRepository extends AppPostgreRepository
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @param {DateTimeHelper} dateTimeHelper
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly prismaPostgreService: DatabasePrismaPostgreDriver,
        private readonly dateTimeHelper: DateTimeHelper
    )
    {
        super (
            configService,
            i18nService,
            prismaPostgreService
        );
    }

    /**
     * @param {string} userId
     * @returns {Promise<{ user: User; profile: Profile | null } | null>}
     */
    public async getMe (
        userId: string
    ): Promise<{ user: User; profile: Profile | null } | null>
    {
        return this.accessGet (async () => {
            const user: User = await this.prismaPostgreService.user.findFirstOrThrow ({
                where: {
                    ... this.softDelete (),
                    id: userId,
                },
            });

            const profile: Profile | null = await this.prismaPostgreService.profile.findUnique ({
                where: { user_id: userId, },
            });

            return { user, profile, };
        });
    }

    /**
     * @param {string} userId
     * @param {Record<string, unknown>} userData
     * @param {Record<string, unknown>} profileData
     * @param {string | null | undefined} avatarPath
     * @returns {Promise<{ user: User; profile: Profile } | null>}
     */
    public async updateMe (
        userId: string,
        userData: Record<string, unknown>,
        profileData: Record<string, unknown>,
        avatarPath?: string | null
    ): Promise<{ user: User; profile: Profile } | null>
    {
        return this.mutate (async (transaction) => {
            const existingProfile: Profile | null = await transaction.profile.findUnique ({
                where: { user_id: userId, },
            });

            if (avatarPath && existingProfile?.avatar) {
                await this.deleteAvatar (existingProfile.avatar);
            }

            const user: User = await transaction.user.update ({
                where: { id: userId, },
                data: {
                    ... userData,
                    updated_at: this.dateTimeHelper.now (),
                },
            });

            const profile: Profile = await transaction.profile.upsert ({
                where: { user_id: userId, },
                create: {
                    id: ulid (),
                    user_id: userId,
                    full_name: (profileData.full_name as string | null) ?? null,
                    avatar: avatarPath ?? null,
                    interests: (profileData.interests as string[]) ?? [],
                    created_at: this.dateTimeHelper.now (),
                    updated_at: this.dateTimeHelper.now (),
                },
                update: {
                    full_name: (profileData.full_name as string | null) ?? null,
                    ...(avatarPath !== undefined ? { avatar: avatarPath, } : {}),
                    interests: (profileData.interests as string[]) ?? [],
                    updated_at: this.dateTimeHelper.now (),
                },
            });

            return { user, profile, };
        });
    }

    /**
     * @param {string | null | undefined} avatarPath
     * @returns {Promise<void>}
     */
    protected async deleteAvatar (
        avatarPath?: string | null
    ): Promise<void>
    {
        if (! avatarPath) {
            return;
        }

        const publicPath: string = this.configService.get<string> ("storage.disks.public.path") ?? "";
        const filePath: string = join (publicPath, avatarPath.replace (/^\//, ""));

        try {
            await unlink (filePath);
        } catch {
            //
        }
    }

    /**
     * @returns {Promise<string[]>}
     */
    public async profileInterests (): Promise<string[]>
    {
        const profiles: Profile[] = await this.prismaPostgreService.profile.findMany ({
            where: { interests: { not: null, }, },
        });

        const values: Set<string> = new Set ();

        for (const profile of profiles) {
            const interests: string[] = Array.isArray (profile.interests)
                ? profile.interests as string[]
                : [];

            for (const interest of interests) {
                const trimmed: string = String (interest).trim ();

                if (trimmed) {
                    values.add (trimmed);
                }
            }
        }

        return Array.from (values).sort ();
    }
}
