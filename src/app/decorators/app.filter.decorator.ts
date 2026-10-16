"use strict";

import { applyDecorators, createParamDecorator, ExecutionContext, ParseArrayPipe, } from "@nestjs/common";
import { ApiQuery, } from "@nestjs/swagger";
import { parseUnifiedFilters, } from "src/app/helpers/query.parser.helper";
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
            example: "status:unread,type:info",
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
        const filters = ctx.switchToHttp ().getRequest ().query[field];
        const unified = parseUnifiedFilters (filters);

        if (unified) {
            return unified;
        }

        if (! String (filters ?? "").includes ("{")) {
            return [];
        }

        return new ParseArrayPipe ({ items: Filterization<T>, separator, }).transform (filters || [], { type: "query", });
    }) ();
};
