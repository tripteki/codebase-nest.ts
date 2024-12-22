"use strict";

import { INestApplication, } from "@nestjs/common";
import { I18nValidationExceptionFilter, I18nValidationPipe, I18nMiddleware, } from "nestjs-i18n";
import { ConfigService, } from "@nestjs/config";

/**
 * @class {AppI18NProvider}
 * @implements {AppProviderContract}
 */
export class AppI18NProvider
{
    /**
     * @param {(() => INestApplication | Promise<INestApplication>)} app
     * @returns {void | Promise<void>}
     */
    public static async register (app: (() => INestApplication | Promise<INestApplication>)): Promise<void>
    {
        //
    }

    /**
     * @param {INestApplication} app
     * @returns {void | Promise<void>}
     */
    public static async boot (app: INestApplication): Promise<void>
    {
        AppI18NProvider.bootI18N (app);
    }

    /**
     * @param {INestApplication} app
     * @returns {void | Promise<void>}
     */
    public static async bootI18N (app): Promise<void>
    {
        const configService: ConfigService = app.get (
            ConfigService
        );

        app.useGlobalFilters (new I18nValidationExceptionFilter ());
        app.useGlobalPipes (new I18nValidationPipe ());
        app.use (I18nMiddleware);
    }
};
