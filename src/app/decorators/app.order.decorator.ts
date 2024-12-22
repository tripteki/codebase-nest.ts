"use strict";

import { applyDecorators, createParamDecorator, ExecutionContext, ParseArrayPipe, } from "@nestjs/common";
import { ApiQuery, } from "@nestjs/swagger";
import { Orderization, } from "src/app/repositories/app.repository";

/**
 * @function {AppApiOrderQueryStringDecorator}
 * @param {string} field
 * @returns {MethodDecorator}
 */
export function AppApiOrderQueryStringDecorator (
    field: string = "orders"
): MethodDecorator
{
    return applyDecorators (
        ApiQuery ({
            name: field,
            required: false,
            type: String,
            description: `The ${field} parameters for ordering the results`,
            example: '{"field":"id","direction":"asc"}|{"field":"id","direction":"desc"}',
        })
    );
};

/**
 * @function {AppOrderQueryStringDecorator<T>}
 * @param {string} field
 * @param {string} separator
 * @returns {ParameterDecorator}
 */
export function AppOrderQueryStringDecorator<T> (
    field: string = "orders",
    separator = "|"
): ParameterDecorator
{
    return createParamDecorator ((
        data: any,
        ctx: ExecutionContext
    ) => {
        const orders: Orderization<T>[] = ctx.switchToHttp ().getRequest ().query[field] || [];
        return new ParseArrayPipe ({ items: Orderization<T>, separator, }).transform (orders, { type: "query", });
    }) ();
};
