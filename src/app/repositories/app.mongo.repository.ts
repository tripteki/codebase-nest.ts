"use strict";

import { Prisma as DatabasePrismaMongoConstraint, } from "@prisma/mongo/client";
import { DatabasePrismaMongoDriver, } from "src/app/drivers/database.driver";
import { Logger as LoggerService, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import {

    AppRepository,
    AppPaginationOffsetRepository,
    AppPaginationCursorRepository,
    OffsetPaginationType,
    CursorPaginationType,
    OffsetPagination,
    CursorPagination,
    SoftDeletion,
    Orderization,
    Filterization,

} from "src/app/repositories/app.repository";

/**
 * @class {AppMongoRepository}
 * @abstract {AppMongoRepository}
 * @implements {AppRepository}
 */
export abstract class AppMongoRepository implements AppRepository, AppPaginationOffsetRepository, AppPaginationCursorRepository
{
    /**
     * @param {ConfigService} configService
     * @param {DatabasePrismaMongoDriver} prismaMongoService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly prismaMongoService: DatabasePrismaMongoDriver
    )
    {
        //
    }

    /**
     * @returns {SoftDeletion}
     */
    protected softDelete (): SoftDeletion
    {
        return {

            deleted_at: null,
        };
    }

    /**
     * @params {Orderization<T>[]} orders
     * @returns {{ orderBy: Record<string, "asc" | "desc">[]; }}
     */
    protected order<T> (
        orders: Orderization<T>[]
    ): {
        orderBy: Record<string, "asc" | "desc">[];
    }
    {
        return {
            orderBy: orders.map ((order: Orderization<T>) => ({ [order.field]: order.direction, })),
        };
    }

    /**
     * @param {Filterization<T>[]} filters
     * @returns {Record<string, { contains: string }>}
     */
    protected filter<T> (
        filters: Filterization<T>[]
    ): Record<string, { contains: string }> {
        return filters.reduce ((filter, { field, search }: Filterization<T>) => {
            filter[field as string] = { contains: search, }; return filter;
        }, {} as Record<string, { contains: string }>);
    }

    /**
     * @template T
     * @param {string} entity
     * @param {Record<string, any>} query
     * @param {OffsetPaginationType} page
     * @returns {Promise<OffsetPagination<T>>}
     */
    public async offsetPaginateAll<T> (
        entity: string,
        query: Record<string, any>,
        page: OffsetPaginationType
    ): Promise<OffsetPagination<T>>
    {
        const [ allQuery, lengthQuery, ]: [ T[], number, ] = await this.prismaMongoService.$transaction ([

            this.prismaMongoService[entity].findMany ({ ... query, ... { skip: (page.currentPage - 1) * page.limitPage, take: page.limitPage, }, }),
            this.prismaMongoService[entity].count (query),
        ]),

        perPage: number = page.limitPage,
        currentPage: number = page.currentPage,
        lastPage: number = Math.ceil (lengthQuery / perPage);

        return {

            totalPage: lastPage,
            perPage,
            currentPage,
            nextPage: currentPage < lastPage ? currentPage + 1 : null,
            previousPage: currentPage > 1 ? currentPage - 1 : null,
            firstPage: 1,
            lastPage: lastPage,
            data: allQuery,
        };
    }

    /**
     * @template T
     * @param {string} entity
     * @param {Record<string, any>} query
     * @param {CursorPaginationType} page
     * @returns {Promise<CursorPagination<T>>}
     */
    public async cursorPaginateAll<T> (
        entity: string,
        query: Record<string, any>,
        page: CursorPaginationType
    ): Promise<CursorPagination<T>>
    {
        const [ allQuery, ]: [ T[], ] = await this.prismaMongoService.$transaction ([

            this.prismaMongoService[entity].findMany ({ ... query, cursor: page.cursorPage ? { [page.cursorField]: page.cursorPage, } : undefined, ... { skip: 0, take: page.limitPage + 1, }, }),
        ]),

        hasNextPage: boolean = allQuery.length > page.limitPage;

        return {

            nextCursorPage: hasNextPage ? allQuery[allQuery.length - 1]?.[page.cursorField] : null,
            data: hasNextPage ? allQuery.slice(0, -1) : allQuery,
        };
    }

    /**
     * @template T
     * @param {Function} callback
     * @returns {Promise<T[]>}
     */
    public async accessAll<T> (
        callback: () => Promise<T[]>
    ): Promise<T[]>
    {
        const content: T[] = await callback ();

        return content;
    }

    /**
     * @template T
     * @param {Function} callback
     * @returns {Promise<T | null>}
     */
    public async accessGet<T> (
        callback: () => Promise<T | null>
    ): Promise<T | null>
    {
        const content: T | null = await callback ();

        return content;
    }

    /**
     * @template T
     * @param {Function} callback
     * @returns {Promise<T | null>}
     */
    public async mutate<T> (
        callback: (prismaTransaction: DatabasePrismaMongoConstraint.TransactionClient) => Promise<T | null>
    ): Promise<T | null>
    {
        let content: T | null = null;

        try {

            await this.prismaMongoService.$transaction (
                async (prismaTransaction: DatabasePrismaMongoConstraint.TransactionClient): Promise<void> => {
                    content = await callback (prismaTransaction);
                }
            );

            return content;

        } catch (error: unknown) {

            LoggerService.warn (error);
        }
    }
};
