"use strict";

import { INestApplication, } from "@nestjs/common";
import { NestExpressApplication, } from "@nestjs/platform-express";
import { ConfigService, } from "@nestjs/config";
import { join, } from "path";
import hbs from "hbs";

/**
 * @class {AppViewProvider}
 */
export class AppViewProvider
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
        AppViewProvider.bootView (app as NestExpressApplication);
    }

    /**
     * @param {NestExpressApplication} app
     * @returns {Promise<void>}
     */
    public static async bootView (app: NestExpressApplication): Promise<void>
    {
        const configService: ConfigService = app.get (
            ConfigService
        );

        app.useStaticAssets (join (__dirname, "../../../", "public/"));
        app.setBaseViewsDir (join (__dirname, "../", "views/"));
        app.setViewEngine ("hbs");
    }
};
