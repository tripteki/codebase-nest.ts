import { Injectable, } from "@nestjs/common";
import { Prisma as DatabasePrismaPostgreConstraint, Notification, } from "@prisma/client";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { BatchPayloadType, } from "src/app/dtos/app.dto";
import { OffsetPaginationType, CursorPaginationType, OffsetPagination, CursorPagination, Orderization, Filterization, } from "src/app/repositories/app.repository";
import { AppPostgreRepository, } from "src/app/repositories/app.postgre.repository";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { ulid, } from "ulid";

@Injectable ()
/**
 * @class {NotificationUserRepository}
 * @extends {AppPostgreRepository}
 */
export class NotificationUserRepository extends AppPostgreRepository
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
     * @param {Orderization<Notification>[]} orders
     * @param {Filterization<Notification>[]} filters
     * @param {OffsetPaginationType} page
     * @returns {Promise<Notification[]>}
     */
    public async allOffset (
        userId: string,
        orders: Orderization<Notification>[] = [],
        filters: Filterization<Notification>[] = [],
        page: OffsetPaginationType = { currentPage: 1, limitPage: 10, }
    ): Promise<OffsetPagination<Notification>>
    {
        return this.offsetPaginateAll<Notification> ("notification", {
            where: {
                ... this.softDelete (),
                ... this.filter (filters),
                user_id: userId,
            },
            orderBy: orders.length ? this.order (orders).orderBy : [
                { updated_at: "desc", },
                { read_at: "desc", },
            ],
            include: {
                user: true,
            },
        }, page);
    }

    /**
     * @param {string} userId
     * @param {Orderization<Notification>[]} orders
     * @param {Filterization<Notification>[]} filters
     * @param {CursorPaginationType} page
     * @returns {Promise<Notification[]>}
     */
    public async allCursor (
        userId: string,
        orders: Orderization<Notification>[] = [],
        filters: Filterization<Notification>[] = [],
        page: CursorPaginationType = { limitPage: 10, }
    ): Promise<CursorPagination<Notification>>
    {
        page.cursorField = "id";

        return this.cursorPaginateAll<Notification> ("notification", {
            where: {
                ... this.softDelete (),
                ... this.filter (filters),
                user_id: userId,
            },
            orderBy: orders.length ? this.order (orders).orderBy : [
                { updated_at: "desc", },
                { read_at: "desc", },
            ],
            include: {
                user: true,
            },
        }, page);
    }

    /**
     * @param {string} userId
     * @returns {Promise<number>}
     */
    public async count (
        userId: string
    ): Promise<number>
    {
        return this.accessGet<number> (async (): Promise<number> => {
            return await this.prismaPostgreService.notification.count ({
                where: {
                    ... this.softDelete (),
                    user_id: userId,
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @param {string} id
     * @returns {Promise<Notification | null>}
     */
    public async get (
        userId: string,
        id: string
    ): Promise<Notification | null>
    {
        return this.accessGet<Notification> (async (): Promise<Notification | null> => {
            return await this.prismaPostgreService.notification.findFirstOrThrow ({
                where: {
                    ... this.softDelete (),
                    user_id: userId,
                    id,
                },
                include: {
                    user: true,
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @param {string} id
     * @param {DatabasePrismaPostgreConstraint.NotificationUpdateInput} data
     * @returns {Promise<Notification | null>}
     */
    public async update (
        userId: string,
        id: string,
        data: DatabasePrismaPostgreConstraint.NotificationUpdateInput
    ): Promise<Notification | null>
    {
        return this.mutate<Notification> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<Notification | null> => {
            return await transaction.notification.update ({
                where: {
                    ... this.softDelete (),
                    user_id: userId,
                    id,
                },
                data: {
                    type: data.type,
                    data: data.data,
                    updated_at: this.dateTimeHelper.now (),
                },
                include: {
                    user: true,
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @param {DatabasePrismaPostgreConstraint.NotificationCreateInput} data
     * @returns {Promise<Notification | null>}
     */
    public async create (
        userId: string,
        data: DatabasePrismaPostgreConstraint.NotificationCreateInput
    ): Promise<Notification | null>
    {
        return this.mutate<Notification> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<Notification | null> => {
            return await transaction.notification.create ({
                data: {
                    id: ulid (),
                    user_id: userId,
                    type: data.type,
                    data: data.data,
                    created_at: this.dateTimeHelper.now (),
                    updated_at: this.dateTimeHelper.now (),
                },
                include: {
                    user: true,
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @param {string} id
     * @returns {Promise<Notification | null>}
     */
    public async restore (
        userId: string,
        id: string
    ): Promise<Notification | null>
    {
        return this.mutate<Notification> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<Notification | null> => {
            return await transaction.notification.update ({
                where: {
                    deleted_at: { not: null, },
                    user_id: userId,
                    id,
                },
                data: {
                    deleted_at: null,
                    updated_at: this.dateTimeHelper.now (),
                },
                include: {
                    user: true,
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @param {string} id
     * @returns {Promise<Notification | null>}
     */
    public async delete (
        userId: string,
        id: string
    ): Promise<Notification | null>
    {
        return this.mutate<Notification> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<Notification | null> => {
            return await transaction.notification.update ({
                where: {
                    ... this.softDelete (),
                    user_id: userId,
                    id,
                },
                data: {
                    deleted_at: this.dateTimeHelper.now (),
                    updated_at: this.dateTimeHelper.now (),
                },
                include: {
                    user: true,
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @returns {Promise<BatchPayloadType>}
     */
    public async readAll (
        userId: string
    ): Promise<BatchPayloadType>
    {
        return this.mutate<BatchPayloadType> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<BatchPayloadType> => {
            return await transaction.notification.updateMany ({
                where: {
                    ... this.softDelete (),
                    read_at: null,
                    user_id: userId,
                },
                data: {
                    read_at: this.dateTimeHelper.now (),
                    updated_at: this.dateTimeHelper.now (),
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @param {string} id
     * @returns {Promise<Notification | null>}
     */
    public async read (
        userId: string,
        id: string
    ): Promise<Notification | null>
    {
        return this.mutate<Notification> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<Notification | null> => {
            return await transaction.notification.update ({
                where: {
                    ... this.softDelete (),
                    read_at: null,
                    user_id: userId,
                    id,
                },
                data: {
                    read_at: this.dateTimeHelper.now (),
                    updated_at: this.dateTimeHelper.now (),
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @returns {Promise<number>}
     */
    public async unread (
        userId: string
    ): Promise<number>
    {
        return this.accessGet<number> (async (): Promise<number> => {
            return await this.prismaPostgreService.notification.count ({
                where: {
                    ... this.softDelete (),
                    read_at: null,
                    user_id: userId,
                },
            });
        });
    }
}
