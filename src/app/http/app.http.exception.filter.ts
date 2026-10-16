"use strict";

import { Request, Response, } from "express";
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, NotFoundException, } from "@nestjs/common";
import { I18nValidationException, I18nValidationExceptionFilter, } from "nestjs-i18n";

/**
 * @param {unknown} body
 * @param {string} fallback
 * @returns {{ detail: unknown }}
 */
export const toDetailBody = (body: unknown, fallback: string): { detail: unknown; } =>
{
    if (typeof body === "string") {
        return { detail: body, };
    }

    if (body && typeof body === "object") {
        const record = body as Record<string, unknown>;

        if ("detail" in record) {
            return { detail: record.detail, };
        }

        if ("code" in record) {
            return { detail: { code: record.code, message: record.message, }, };
        }

        if (Array.isArray (record.message)) {
            return { detail: record.message.join (" "), };
        }

        if (typeof record.message === "string") {
            return { detail: record.message, };
        }
    }

    return { detail: fallback, };
};

/**
 * @param {Request} request
 * @returns {string[]}
 */
const routeMethods = (request: Request): string[] =>
{
    const methods = new Set<string> ();

    for (const layer of (request.app as any)?._router?.stack ?? []) {
        if (layer.route && typeof layer.match === "function" && layer.match (request.path)) {
            Object.keys (layer.route.methods).forEach ((method) => methods.add (method.toUpperCase ()));
        }
    }

    return [ ... methods, ];
};

@Catch (HttpException)
/**
 * @class {AppHttpExceptionFilter}
 * @implements {ExceptionFilter}
 */
export class AppHttpExceptionFilter implements ExceptionFilter
{
    /**
     * @param {I18nValidationExceptionFilter} validationFilter
     * @returns {void}
     */
    constructor (
        protected readonly validationFilter: I18nValidationExceptionFilter
    )
    {
        //
    }

    /**
     * @param {HttpException} exception
     * @param {ArgumentsHost} host
     * @returns {unknown}
     */
    public catch (exception: HttpException, host: ArgumentsHost): unknown
    {
        if (exception instanceof I18nValidationException) {
            return this.validationFilter.catch (exception, host);
        }

        const response = host.switchToHttp ().getResponse<Response> ();

        if (exception instanceof NotFoundException && /^Cannot [A-Z]+ /.test (exception.message)) {
            const methods = routeMethods (host.switchToHttp ().getRequest<Request> ());

            if (methods.length) {
                return response.status (405).set ("Allow", methods.join (", ")).json ({ detail: "Method Not Allowed", });
            }

            return response.status (404).json ({ detail: "Not Found", });
        }

        return response
            .status (exception.getStatus ())
            .json (toDetailBody (exception.getResponse (), exception.message));
    }
}
