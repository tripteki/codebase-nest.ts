import { Injectable, } from "@nestjs/common";
import { Prisma as DatabasePrismaPostgreConstraint, User, } from "@prisma/client";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { ConfigService, } from "@nestjs/config";
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
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @param {DateTimeHelper} dateTimeHelper
     * @param {HasherHelper} hasherHelper
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly prismaPostgreService: DatabasePrismaPostgreDriver,
        private readonly dateTimeHelper: DateTimeHelper,
        private readonly hasherHelper: HasherHelper
    )
    {
        super (
            configService,
            prismaPostgreService
        );
    }

    /**
     * @param {Orderization<User>[]} orders
     * @param {Filterization<User>[]} filters
     * @param {OffsetPaginationType} page
     * @returns {Promise<User[]>}
     */
    public async allOffset (
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
     * @param {Orderization<User>[]} orders
     * @param {Filterization<User>[]} filters
     * @param {CursorPaginationType} page
     * @returns {Promise<User[]>}
     */
    public async allCursor (
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
     * @param {string} id
     * @returns {Promise<User | null>}
     */
    public async get (
        id: string
    ): Promise<User | null>
    {
        return this.accessGet<User> (async (): Promise<User | null> => {
            return await this.prismaPostgreService.user.findFirst ({
                where: {
                    ... this.softDelete (),
                    id,
                },
            });
        });
    }

    /**
     * @param {string} id
     * @param {DatabasePrismaPostgreConstraint.UserUpdateInput} data
     * @returns {Promise<User | null>}
     */
    public async update (
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
                },
            });
        });
    }

    /**
     * @param {DatabasePrismaPostgreConstraint.UserCreateInput} data
     * @returns {Promise<User | null>}
     */
    public async create (
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
     * @param {string} id
     * @returns {Promise<User | null>}
     */
    public async restore (
        id: string
    ): Promise<User | null>
    {
        return this.mutate<User> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<User | null> => {
            return await transaction.user.update ({
                where: {
                    id,
                },
                data: {
                    deleted_at: null,
                },
            });
        });
    }

    /**
     * @param {string} id
     * @returns {Promise<User | null>}
     */
    public async delete (
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
                },
            });
        });
    }
}