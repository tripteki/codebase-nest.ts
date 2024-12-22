import { Injectable, } from "@nestjs/common";
import { Prisma as DatabasePrismaPostgreConstraint, User, } from "@prisma/client";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { AppPostgreRepository, } from "src/app/repositories/app.postgre.repository";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { HasherHelper, } from "src/app/helpers/hasher.helper";
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
     * @param {DatabasePrismaPostgreConstraint.UserWhereInput} data
     * @returns {Promise<User | null>}
     */
    public async login (
        data: DatabasePrismaPostgreConstraint.UserWhereInput
    ): Promise<User | null>
    {
        return this.accessGet<User> (async (): Promise<User | null> => {
            const user: User | null = await this.prismaPostgreService.user.findFirstOrThrow ({
                where: {
                    ... this.softDelete (),
                    name: data.name,
                    email: data.email,
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
     * @param {string} id
     * @returns {Promise<User | null>}
     */
    public async logout (
        id: string
    ): Promise<User | null>
    {
        return this.accessGet<User> (async (): Promise<User | null> => {
            return await this.prismaPostgreService.user.findFirstOrThrow ({
                where: {
                    ... this.softDelete (),
                    id,
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
}
