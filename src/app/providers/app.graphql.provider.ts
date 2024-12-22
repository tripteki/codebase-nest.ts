"use strict";

import { INestApplication, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";

/**
 * @class {AppGraphqlProvider}
 * @implements {AppProviderContract}
 */
export class AppGraphqlProvider
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
        //
    }

    /**
     * @param {INestApplication} app
     * @returns {void | Promise<void>}
     */
    public static async bootPlayground (app): Promise<void>
    {
        const configService: ConfigService = app.get (
            ConfigService
        );

        if (configService.get<string> ("app.env") !== "production") {

            //
        }
    }
};
