"use strict";

import { IsDefined, IsOptional, MinLength, MaxLength, IsIn, IsInt, IsString, } from "class-validator";

/**
 * @interface {AppRepository}
 */
export interface AppRepository
{
    /**
     * @template T
     * @param {Function} callback
     * @returns {Promise<T | null>}
     */
    accessGet<T> (callback: Function): Promise<T | null>;

    /**
     * @template T
     * @param {Function} callback
     * @returns {Promise<T | null>}
     */
    mutate<T> (callback: Function): Promise<T | null>;
};

/**
 * @interface {AppPaginationOffsetRepository}
 */
export interface AppPaginationOffsetRepository
{
    /**
     * @template T
     * @param {string} entity
     * @param {Record<string, any>} query
     * @param {OffsetPaginationType} page
     * @returns {Promise<OffsetPagination<T>>}
     */
    offsetPaginateAll<T> (entity: string, query: Record<string, any>, page: OffsetPaginationType): Promise<OffsetPagination<T>>
};

/**
 * @interface {AppPaginationCursorRepository}
 */
export interface AppPaginationCursorRepository
{
    /**
     * @template T
     * @param {string} entity
     * @param {Record<string, any>} query
     * @param {CursorPaginationType} page
     * @returns {Promise<CursorPagination<T>>}
     */
    cursorPaginateAll<T> (entity: string, query: Record<string, any>, page: CursorPaginationType): Promise<CursorPagination<T>>
};

/**
 * @class {SoftDeletion}
 */
export class SoftDeletion
{
    @IsOptional ()
    /**
     * @type {Date | null}
     */
    deleted_at: Date | null;
};

/**
 * @class {OffsetPaginationType}
 */
export class OffsetPaginationType
{
    @IsOptional ()
    @IsInt ()
    @MinLength (1)
    /**
     * @type {number | null}
     */
    currentPage?: number | null;

    @IsOptional ()
    @IsInt ()
    @MinLength (10)
    @MaxLength (100)
    /**
     * @type {number | null}
     */
    limitPage?: number | null;
};

/**
 * @class {CursorPaginationType}
 */
export class CursorPaginationType
{
    /**
     * @type {string}
     */
    cursorField?: string;

    @IsOptional ()
    /**
     * @type {number | string | null}
     */
    cursorPage?: number | string | null;

    @IsOptional ()
    @IsInt ()
    @MinLength (10)
    @MaxLength (100)
    /**
     * @type {number | null}
     */
    limitPage?: number | null;
};

/**
 * @class {OffsetPagination<T>}
 */
export class OffsetPagination<T>
{
    /**
     * @type {number}
     */
    totalPage: number;

    /**
     * @type {number}
     */
    perPage: number;

    /**
     * @type {number}
     */
    currentPage: number;

    /**
     * @type {number | null}
     */
    nextPage: number | null;

    /**
     * @type {number | null}
     */
    previousPage: number | null;

    /**
     * @type {number}
     */
    firstPage: number;

    /**
     * @type {number}
     */
    lastPage: number;

    /**
     * @type {T[]}
     */
    data: T[];
};

/**
 * @class {CursorPagination<T>}
 */
export class CursorPagination<T>
{
    /**
     * @type {number | string | null}
     */
    nextCursorPage: number | string | null;

    /**
     * @type {T[]}
     */
    data: T[];
};

/**
 * @class {Orderization<T>}
 */
export class Orderization<T>
{
    @IsDefined ()
    @IsString ()
    /**
     * @type {keyof T}
     */
    field: keyof T;

    @IsDefined ()
    @IsIn ([ "asc", "desc", ])
    /**
     * @type {"asc" | "desc"}
     */
    direction: "asc" | "desc";
};

/**
 * @class {Filterization<T>}
 */
export class Filterization<T>
{
    @IsDefined ()
    @IsString ()
    /**
     * @type {keyof T}
     */
    field: keyof T;

    @IsDefined ()
    @IsString ()
    /**
     * @type {string}
     */
    search: string;
};
