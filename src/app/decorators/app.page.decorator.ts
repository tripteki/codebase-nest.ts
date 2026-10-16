"use strict";

import { applyDecorators, createParamDecorator, ExecutionContext, UnprocessableEntityException, } from "@nestjs/common";
import { ApiQuery, } from "@nestjs/swagger";

/**
 * @param {Record<string, unknown>} query
 * @param {string} field
 * @param {number} fallback
 * @param {number | null} max
 * @param {Record<string, unknown>[]} details
 * @returns {number}
 */
function pageNumber (
    query: Record<string, unknown>,
    field: string,
    fallback: number,
    max: number | null,
    details: Record<string, unknown>[]
): number
{
    const raw = query[field];

    if (raw === undefined || raw === null || raw === "") return fallback;

    const text = typeof raw === "string" ? raw.trim () : "";

    if (! /^[+-]?\d+$/.test (text)) {
        details.push ({ type: "int_parsing", loc: [ "query", field, ], msg: "Input should be a valid integer, unable to parse string as an integer", input: raw, ctx: {}, });

        return fallback;
    }

    const value = Number (text);

    if (value < 1) {
        details.push ({ type: "greater_than_equal", loc: [ "query", field, ], msg: "Input should be greater than or equal to 1", input: raw, ctx: { ge: 1, }, });
    } else if (max !== null && value > max) {
        details.push ({ type: "less_than_equal", loc: [ "query", field, ], msg: `Input should be less than or equal to ${max}`, input: raw, ctx: { le: max, }, });
    }

    return value;
}

/**
 * @param {ExecutionContext} ctx
 * @param {number} maxLimitPage
 * @returns {{ limitPage: number; currentPage: number; }}
 */
function parsePage (ctx: ExecutionContext, maxLimitPage: number): { limitPage: number; currentPage: number; }
{
    const query = ctx.switchToHttp ().getRequest ().query ?? {};
    const details: Record<string, unknown>[] = [];
    const limitPage = pageNumber (query, "limitPage", 10, maxLimitPage, details);
    const currentPage = pageNumber (query, "currentPage", 1, null, details);

    if (details.length) throw new UnprocessableEntityException ({ detail: details, });

    return { limitPage, currentPage, };
}

/**
 * @function {AppApiLimitPageQueryStringDecorator}
 * @param {string} field
 * @returns {MethodDecorator}
 */
export function AppApiLimitPageQueryStringDecorator (
    field: string = "limitPage"
): MethodDecorator
{
    return applyDecorators (
        ApiQuery ({
            name: field,
            required: false,
            type: Number,
            description: "The number of results per page for pagination",
            example: 10,
        })
    );
};

/**
 * @function {AppLimitPageQueryStringDecorator<T>}
 * @param {string} field
 * @param {number} maxLimitPage
 * @returns {ParameterDecorator}
 */
export function AppLimitPageQueryStringDecorator<T> (
    field: string = "limitPage",
    maxLimitPage: number = 100
): ParameterDecorator
{
    return createParamDecorator ((
        data: any,
        ctx: ExecutionContext
    ) => parsePage (ctx, maxLimitPage).limitPage) ();
};

/**
 * @function {AppApiCurrentPageQueryStringDecorator}
 * @param {string} field
 * @returns {MethodDecorator}
 */
export function AppApiCurrentPageQueryStringDecorator (
    field: string = "currentPage"
): MethodDecorator
{
    return applyDecorators (
        ApiQuery ({
            name: field,
            required: false,
            type: Number,
            description: "The current page number for pagination",
            example: 1,
        })
    );
};

/**
 * @function {AppCurrentPageQueryStringDecorator<T>}
 * @param {string} field
 * @param {number} maxLimitPage
 * @returns {ParameterDecorator}
 */
export function AppCurrentPageQueryStringDecorator<T> (
    field: string = "currentPage",
    maxLimitPage: number = 100
): ParameterDecorator
{
    return createParamDecorator ((
        data: any,
        ctx: ExecutionContext
    ) => parsePage (ctx, maxLimitPage).currentPage) ();
};
