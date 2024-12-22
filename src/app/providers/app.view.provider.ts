"use strict";

import { INestApplication, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { join, } from "path";
import hbs from "hbs";

/**
 * @class {AppViewProvider}
 * @implements {AppProviderContract}
 */
export class AppViewProvider
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
        AppViewProvider.bootView (app);
    }

    /**
     * @param {INestApplication} app
     * @returns {void | Promise<void>}
     */
    public static async bootView (app): Promise<void>
    {
        const configService: ConfigService = app.get (
            ConfigService
        );

        app.useStaticAssets (join (__dirname, "../../../", "public/"));
        app.setBaseViewsDir (join (__dirname, "../", "views/"));
        app.setViewEngine ("hbs");
    }
};
