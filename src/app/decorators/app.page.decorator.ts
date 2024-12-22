"use strict";

import { applyDecorators, createParamDecorator, ExecutionContext, ParseIntPipe, } from "@nestjs/common";
import { ApiQuery, } from "@nestjs/swagger";

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
 * @returns {ParameterDecorator}
 */
export function AppLimitPageQueryStringDecorator<T> (
    field: string = "limitPage"
): ParameterDecorator
{
    return createParamDecorator ((
        data: any,
        ctx: ExecutionContext
    ) => {
        const limitPage: string = ctx.switchToHttp ().getRequest ().query[field] || 10;
        return new ParseIntPipe ().transform (limitPage, { type: "query", });
    }) ();
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
 * @returns {ParameterDecorator}
 */
export function AppCurrentPageQueryStringDecorator<T> (
    field: string = "currentPage"
): ParameterDecorator
{
    return createParamDecorator ((
        data: any,
        ctx: ExecutionContext
    ) => {
        const currentPage: string = ctx.switchToHttp ().getRequest ().query[field] || 1;
        return new ParseIntPipe ().transform (currentPage, { type: "query", });
    }) ();
};
