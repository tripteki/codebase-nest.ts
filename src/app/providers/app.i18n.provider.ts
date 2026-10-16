"use strict";

import { INestApplication, } from "@nestjs/common";
import { ValidationError, } from "class-validator";
import { I18nValidationExceptionFilter, I18nValidationPipe, I18nMiddleware, } from "nestjs-i18n";
import { ConfigService, } from "@nestjs/config";
import { toFastApiValidationDetail, } from "src/app/http/app.validation.response";
import { AppHttpExceptionFilter, } from "src/app/http/app.http.exception.filter";

/**
 * @class {AppI18NProvider}
 */
export class AppI18NProvider
{
    /**
     * @param {(() => INestApplication | Promise<INestApplication>)} app
     * @returns {Promise<void>}
     */
    public static async register (app: (() => INestApplication | Promise<INestApplication>)): Promise<void>
    {
        //
    }

    /**
     * @param {INestApplication} app
     * @returns {Promise<void>}
     */
    public static async boot (app: INestApplication): Promise<void>
    {
        AppI18NProvider.bootI18N (app);
    }

    /**
     * @param {INestApplication} app
     * @returns {Promise<void>}
     */
    public static async bootI18N (app: INestApplication): Promise<void>
    {
        const configService: ConfigService = app.get (
            ConfigService
        );

        app.useGlobalFilters (new AppHttpExceptionFilter (new I18nValidationExceptionFilter ({
            errorHttpStatusCode: 422,
            errorFormatter: (errors: ValidationError[]) => toFastApiValidationDetail (errors),
            responseBodyFormatter: (_host, _exc, formattedErrors) => ({
                detail: formattedErrors,
            }),
        })));
        app.useGlobalPipes (new I18nValidationPipe ());
        app.use (I18nMiddleware);
    }
};
