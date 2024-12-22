import { Injectable, } from "@nestjs/common";
import { Prisma as DatabasePrismaPostgreConstraint, User, } from "@prisma/client";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { OffsetPaginationType, CursorPaginationType, OffsetPagination, CursorPagination, Orderization, Filterization, } from "src/app/repositories/app.repository";
import { AppPostgreRepository, } from "src/app/repositories/app.postgre.repository";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { HasherHelper, } from "src/app/helpers/hasher.helper";
import { ulid, } from "ulid";

@Injectable ()
/**
 * @class {UserAdminRepository}
 * @extends {AppPostgreRepository}
 */
export class UserAdminRepository extends AppPostgreRepository
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
     * @param {string} userId
     * @param {Orderization<User>[]} orders
     * @param {Filterization<User>[]} filters
     * @param {OffsetPaginationType} page
     * @returns {Promise<User[]>}
     */
    public async allOffset (
        userId: string,
        orders: Orderization<User>[] = [],
        filters: Filterization<User>[] = [],
        page: OffsetPaginationType = { currentPage: 1, limitPage: 10, }
    ): Promise<OffsetPagination<User>>
    {
        return this.offsetPaginateAll<User> ("user", {
            where: {
                ... this.softDelete (),
                ... this.filter (filters),
            },
            ... this.order (orders),
        }, page);
    }

    /**
     * @param {string} userId
     * @param {Orderization<User>[]} orders
     * @param {Filterization<User>[]} filters
     * @param {CursorPaginationType} page
     * @returns {Promise<User[]>}
     */
    public async allCursor (
        userId: string,
        orders: Orderization<User>[] = [],
        filters: Filterization<User>[] = [],
        page: CursorPaginationType = { limitPage: 10, }
    ): Promise<CursorPagination<User>>
    {
        page.cursorField = "id";

        return this.cursorPaginateAll<User> ("user", {
            where: {
                ... this.softDelete (),
                ... this.filter (filters),
            },
            ... this.order (orders),
        }, page);
    }

    /**
     * @param {string} userId
     * @param {string} id
     * @returns {Promise<User | null>}
     */
    public async get (
        userId: string,
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
     * @param {string} userId
     * @param {string} id
     * @param {DatabasePrismaPostgreConstraint.UserUpdateInput} data
     * @returns {Promise<User | null>}
     */
    public async update (
        userId: string,
        id: string,
        data: DatabasePrismaPostgreConstraint.UserUpdateInput
    ): Promise<User | null>
    {
        return this.mutate<User> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<User | null> => {
            return await transaction.user.update ({
                where: {
                    ... this.softDelete (),
                    id,
                },
                data: {
                    name: data.name,
                    email: data.email,
                    password: await this.hasherHelper.hash (data.password as string),
                    updated_at: this.dateTimeHelper.now (),
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @param {DatabasePrismaPostgreConstraint.UserCreateInput} data
     * @returns {Promise<User | null>}
     */
    public async create (
        userId: string,
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
                    email_verified_at: this.dateTimeHelper.now (),
                    created_at: this.dateTimeHelper.now (),
                    updated_at: this.dateTimeHelper.now (),
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @param {string} id
     * @returns {Promise<User | null>}
     */
    public async restore (
        userId: string,
        id: string
    ): Promise<User | null>
    {
        return this.mutate<User> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<User | null> => {
            return await transaction.user.update ({
                where: {
                    deleted_at: { not: null, },
                    id,
                },
                data: {
                    deleted_at: null,
                    updated_at: this.dateTimeHelper.now (),
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @param {string} id
     * @returns {Promise<User | null>}
     */
    public async delete (
        userId: string,
        id: string
    ): Promise<User | null>
    {
        return this.mutate<User> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<User | null> => {
            return await transaction.user.update ({
                where: {
                    ... this.softDelete (),
                    id,
                },
                data: {
                    deleted_at: this.dateTimeHelper.now (),
                    updated_at: this.dateTimeHelper.now (),
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @param {string} id
     * @returns {Promise<User | null>}
     */
    public async verify (
        userId: string,
        id: string
    ): Promise<User | null>
    {
        return this.mutate<User> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<User | null> => {
            return await transaction.user.update ({
                where: {
                    ... this.softDelete (),
                    email_verified_at: null,
                    id,
                },
                data: {
                    email_verified_at: this.dateTimeHelper.now (),
                },
            });
        });
    }
}
