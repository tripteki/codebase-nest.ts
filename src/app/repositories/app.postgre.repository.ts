"use strict";

import { Prisma as DatabasePrismaPostgreConstraint, } from "@prisma/client";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { Logger as LoggerService, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
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
 * @class {AppPostgreRepository}
 * @abstract {AppPostgreRepository}
 * @implements {AppRepository}
 */
export abstract class AppPostgreRepository implements AppRepository, AppPaginationOffsetRepository, AppPaginationCursorRepository
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly prismaPostgreService: DatabasePrismaPostgreDriver
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
        try {

            const [ allQuery, lengthQuery, ]: [ T[], number, ] = await this.prismaPostgreService.$transaction ([

                this.prismaPostgreService[entity].findMany ({ ... query, ... { skip: (page.currentPage - 1) * page.limitPage, take: page.limitPage, }, }),
                this.prismaPostgreService[entity].count ({ where: query?.where, }),
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

        } catch (error: any) {

            LoggerService.warn (error);

            const

            perPage: number = page.limitPage,
            currentPage: number = page.currentPage;

            return {

                totalPage: 1,
                perPage,
                currentPage,
                nextPage: null,
                previousPage: null,
                firstPage: 1,
                lastPage: 1,
                data: [],
            };
        }
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
        try {

            const [ allQuery, ]: [ T[], ] = await this.prismaPostgreService.$transaction ([

                this.prismaPostgreService[entity].findMany ({ ... query, cursor: page.cursorPage ? { [page.cursorField]: page.cursorPage, } : undefined, ... { skip: 0, take: page.limitPage + 1, }, }),
            ]),

            hasNextPage: boolean = allQuery.length > page.limitPage;

            return {

                nextCursorPage: hasNextPage ? allQuery[allQuery.length - 1]?.[page.cursorField] : null,
                data: hasNextPage ? allQuery.slice(0, -1) : allQuery,
            };

        } catch (error: any) {

            LoggerService.warn (error);

            return {

                nextCursorPage: null,
                data: [],
            };
        }
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
        try {

            const content: T[] = await callback ();

            return content;

        } catch (error: any) {

            LoggerService.warn (error);

            throw new Error (error as any);
        }
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
        try {

            const content: T | null = await callback ();

            return content;

        } catch (error: any) {

            LoggerService.warn (error);

            if (error instanceof DatabasePrismaPostgreConstraint.PrismaClientKnownRequestError) {

                if ((error as any).meta.modelName === "Auth") {
                    throw new Error (
                        (error as any).message
                    );
                } else {
                    if ((error as any).code === "P2025") {
                        throw new Error (
                            this.i18nService.t ("validation.exists", { args: { attribute: (error as any).meta.modelName, }, })
                        );
                    }
                }
            }
        }
    }

    /**
     * @template T
     * @param {Function} callback
     * @returns {Promise<T | null>}
     */
    public async mutate<T> (
        callback: (prismaTransaction: DatabasePrismaPostgreConstraint.TransactionClient) => Promise<T | null>
    ): Promise<T | null>
    {
        try {

            let content: T | null = null;

            await this.prismaPostgreService.$transaction (
                async (prismaTransaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<void> => {
                    content = await callback (prismaTransaction);
                }
            );

            return content;

        } catch (error: any) {

            LoggerService.warn (error);

            if (error instanceof DatabasePrismaPostgreConstraint.PrismaClientKnownRequestError) {
                if ((error as any).code === "P2025") {
                    throw new Error (
                        this.i18nService.t ("validation.exists", { args: { attribute: (error as any).meta.modelName, }, })
                    );
                } else if ((error as any).code === "P2002") {
                    throw new Error (
                        this.i18nService.t ("validation.unique", { args: { attribute: (error as any).meta.target[0], }, })
                    );
                }
            }
        }
    }
};
