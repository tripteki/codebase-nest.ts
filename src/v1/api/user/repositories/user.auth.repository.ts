import { Injectable, } from "@nestjs/common";
import { Prisma as DatabasePrismaPostgreConstraint, User, Resetter, } from "@prisma/client";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { AppPostgreRepository, } from "src/app/repositories/app.postgre.repository";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { HasherHelper, } from "src/app/helpers/hasher.helper";
import { UserAuthDto, } from "src/v1/api/user/dtos/user.validator.dto";
import { ulid, } from "ulid";

@Injectable ()
/**
 * @class {UserAuthRepository}
 * @extends {AppPostgreRepository}
 */
export class UserAuthRepository extends AppPostgreRepository
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @param {DateTimeHelper} dateTimeHelper
     * @param {HasherHelper} hasherHelper
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly prismaPostgreService: DatabasePrismaPostgreDriver,
        private readonly dateTimeHelper: DateTimeHelper,
        private readonly hasherHelper: HasherHelper
    )
    {
        super (
            configService,
            i18nService,
            prismaPostgreService
        );
    }

    /**
     * @param {UserAuthDto} data
     * @returns {Promise<User | null>}
     */
    public async login (
        data: UserAuthDto
    ): Promise<User | null>
    {
        return this.accessGet<User> (async (): Promise<User | null> => {
            const user: User | null = await this.prismaPostgreService.user.findFirstOrThrow ({
                where: {
                    ... this.softDelete (),
                    [data.identifierKey]: data.identifierValue,
                },
            });

            if (! (await this.hasherHelper.verify (user.password, data.password as string))) throw new DatabasePrismaPostgreConstraint.PrismaClientKnownRequestError (
            this.i18nService.t ("auth.failed"),
            {
                clientVersion: "clientVersion",
                code: "P2025",
                meta: { modelName: "Auth", },
            });

            return user;
        });
    }

    /**
     * @param {string} userId
     * @returns {Promise<User | null>}
     */
    public async logout (
        userId: string
    ): Promise<User | null>
    {
        return this.accessGet<User> (async (): Promise<User | null> => {
            return await this.prismaPostgreService.user.findFirstOrThrow ({
                where: {
                    ... this.softDelete (),
                    id: userId,
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @returns {Promise<User | null>}
     */
    public async me (
        userId: string
    ): Promise<User | null>
    {
        return this.accessGet<User> (async (): Promise<User | null> => {
            return await this.prismaPostgreService.user.findFirstOrThrow ({
                where: {
                    ... this.softDelete (),
                    id: userId,
                },
            });
        });
    }

    /**
     * @param {DatabasePrismaPostgreConstraint.UserCreateInput} data
     * @returns {Promise<User | null>}
     */
    public async register (
        data: DatabasePrismaPostgreConstraint.UserCreateInput
    ): Promise<User | null>
    {
        return this.mutate<User> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<User | null> => {
            return await transaction.user.create ({
                data: {
                    id: ulid (),
                    name: data.name,
                    email: data.email,
                    password: await this.hasherHelper.hash (data.password as string),
                    created_at: this.dateTimeHelper.now (),
                    updated_at: this.dateTimeHelper.now (),
                },
            });
        });
    }

    /**
     * @param {string} userEmail
     * @returns {Promise<User | null>}
     */
    public async verify (
        userEmail: string
    ): Promise<User | null>
    {
        return this.mutate<User> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<User | null> => {
            return await transaction.user.update ({
                where: {
                    ... this.softDelete (),
                    email_verified_at: null,
                    email: userEmail,
                },
                data: {
                    email_verified_at: this.dateTimeHelper.now (),
                    updated_at: this.dateTimeHelper.now (),
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @returns {Promise<User | null>}
     */
    public async reverify (
        userId: string
    ): Promise<User | null>
    {
        return this.accessGet<User> (async (): Promise<User | null> => {
            return await this.prismaPostgreService.user.findFirstOrThrow ({
                where: {
                    ... this.softDelete (),
                    id: userId,
                },
            });
        });
    }

    /**
     * @param {string} userResetterToken
     * @param {string} userResetterEmail
     * @param {string} password
     * @returns {Promise<User | null>}
     */
    public async reset (
        userResetterToken: string,
        userResetterEmail: string,
        password: string
    ): Promise<User | null>
    {
        return this.mutate<User> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<User | null> => {
            await this.prismaPostgreService.resetter.delete ({
                where: {
                    token: userResetterToken,
                    email: userResetterEmail,
                },
            });

            return await transaction.user.update ({
                where: {
                    ... this.softDelete (),
                    email: userResetterEmail,
                },
                data: {
                    password: await this.hasherHelper.hash (password as string),
                    updated_at: this.dateTimeHelper.now (),
                },
            });
        });
    }

    /**
     * @param {string} userResetterToken
     * @param {string} userResetterEmail
     * @returns {Promise<Resetter | null>}
     */
    public async forget (
        userResetterToken: string,
        userResetterEmail: string
    ): Promise<Resetter | null>
    {
        return this.mutate<Resetter> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<Resetter | null> => {
            await this.prismaPostgreService.user.findFirstOrThrow ({
                where: {
                    ... this.softDelete (),
                    email: userResetterEmail,
                },
            });

            return await transaction.resetter.upsert ({
                where: {
                    email: userResetterEmail,
                },
                update: {
                    token: userResetterToken,
                    created_at: this.dateTimeHelper.now (),
                },
                create: {
                    token: userResetterToken,
                    email: userResetterEmail,
                    created_at: this.dateTimeHelper.now (),
                },
                include: {
                    user: true,
                },
            });
        });
    }
}
