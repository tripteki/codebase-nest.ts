"use strict";

import { INestApplication, Logger, } from "@nestjs/common";

/**
 * @class {AppReplProvider}
 */
export class AppReplProvider
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
        //
    }
};
