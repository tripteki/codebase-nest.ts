"use strict";

import { applyDecorators, createParamDecorator, ExecutionContext, ParseArrayPipe, } from "@nestjs/common";
import { ApiQuery, } from "@nestjs/swagger";
import { parseUnifiedOrders, } from "src/app/helpers/query.parser.helper";
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
            example: "created_at:desc,name:asc",
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
        const orders = ctx.switchToHttp ().getRequest ().query[field];
        const unified = parseUnifiedOrders (orders);

        if (unified) {
            return unified;
        }

        if (! String (orders ?? "").includes ("{")) {
            return [];
        }

        return new ParseArrayPipe ({ items: Orderization<T>, separator, }).transform (orders || [], { type: "query", });
    }) ();
};
