"use strict";

import { applyDecorators, createParamDecorator, ExecutionContext, ParseArrayPipe, } from "@nestjs/common";
import { ApiQuery, } from "@nestjs/swagger";
import { Filterization, } from "src/app/repositories/app.repository";

/**
 * @function {AppApiFilterQueryStringDecorator}
 * @param {string} field
 * @returns {MethodDecorator}
 */
export function AppApiFilterQueryStringDecorator (
    field: string = "filters"
): MethodDecorator
{
    return applyDecorators (
        ApiQuery ({
            name: field,
            required: false,
            type: String,
            description: `The ${field} parameters for filtering the results`,
            example: '{"field":"id","search":"0"}|{"field":"id","search":"1"}',
        })
    );
};

/**
 * @function {AppFilterQueryStringDecorator<T>}
 * @param {string} field
 * @param {string} separator
 * @returns {ParameterDecorator}
 */
export function AppFilterQueryStringDecorator<T> (
    field: string = "filters",
    separator = "|"
): ParameterDecorator
{
    return createParamDecorator ((
        data: any,
        ctx: ExecutionContext
    ) => {
        const filters: Filterization<T>[] = ctx.switchToHttp ().getRequest ().query[field] || [];
        return new ParseArrayPipe ({ items: Filterization<T>, separator, }).transform (filters, { type: "query", });
    }) ();
};
