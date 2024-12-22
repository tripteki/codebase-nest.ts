import { Injectable, } from "@nestjs/common";
import { PushSubscription, } from "@prisma/client";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { AppPostgreRepository, } from "src/app/repositories/app.postgre.repository";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { USER_WEBPUSH_SUBSCRIBABLE_TYPE, } from "src/v1/api/user/dtos/user.webpush.enum";

@Injectable ()
/**
 * @class {UserWebpushRepository}
 * @extends {AppPostgreRepository}
 */
export class UserWebpushRepository extends AppPostgreRepository
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
     * @param {string} endpoint
     * @param {string | null | undefined} publicKey
     * @param {string | null | undefined} authToken
     * @param {string | null | undefined} contentEncoding
     * @returns {Promise<PushSubscription>}
     */
    public async updatePushSubscription (
        userId: string,
        endpoint: string,
        publicKey?: string | null,
        authToken?: string | null,
        contentEncoding?: string | null
    ): Promise<PushSubscription>
    {
        return this.mutate (async (transaction) => {
            const existing: PushSubscription | null = await transaction.pushSubscription.findUnique ({
                where: { endpoint, },
            });

            const now = this.dateTimeHelper.now ();

            if (
                existing &&
                existing.subscribable_id === userId &&
                existing.subscribable_type === USER_WEBPUSH_SUBSCRIBABLE_TYPE
            ) {
                return transaction.pushSubscription.update ({
                    where: { id: existing.id, },
                    data: {
                        public_key: publicKey ?? null,
                        auth_token: authToken ?? null,
                        content_encoding: contentEncoding ?? null,
                        updated_at: now,
                    },
                });
            }

            if (existing) {
                await transaction.pushSubscription.delete ({
                    where: { id: existing.id, },
                });
            }

            return transaction.pushSubscription.create ({
                data: {
                    subscribable_id: userId,
                    subscribable_type: USER_WEBPUSH_SUBSCRIBABLE_TYPE,
                    endpoint,
                    public_key: publicKey ?? null,
                    auth_token: authToken ?? null,
                    content_encoding: contentEncoding ?? null,
                    created_at: now,
                    updated_at: now,
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @param {string} endpoint
     * @returns {Promise<void>}
     */
    public async deletePushSubscription (
        userId: string,
        endpoint: string
    ): Promise<void>
    {
        await this.mutate (async (transaction) => {
            await transaction.pushSubscription.deleteMany ({
                where: {
                    subscribable_id: userId,
                    subscribable_type: USER_WEBPUSH_SUBSCRIBABLE_TYPE,
                    endpoint,
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @returns {Promise<boolean>}
     */
    public async hasPushSubscriptions (
        userId: string
    ): Promise<boolean>
    {
        const count = await this.prismaPostgreService.pushSubscription.count ({
            where: {
                subscribable_id: userId,
                subscribable_type: USER_WEBPUSH_SUBSCRIBABLE_TYPE,
            },
        });

        return count > 0;
    }

    /**
     * @param {string} userId
     * @returns {Promise<PushSubscription[]>}
     */
    public async findByUserId (
        userId: string
    ): Promise<PushSubscription[]>
    {
        return this.prismaPostgreService.pushSubscription.findMany ({
            where: {
                subscribable_id: userId,
                subscribable_type: USER_WEBPUSH_SUBSCRIBABLE_TYPE,
            },
        });
    }

    /**
     * @param {bigint} id
     * @returns {Promise<void>}
     */
    public async deleteById (
        id: bigint
    ): Promise<void>
    {
        await this.prismaPostgreService.pushSubscription.delete ({
            where: { id, },
        });
    }
}
