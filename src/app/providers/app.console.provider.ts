"use strict";

import { INestApplication, Logger, } from "@nestjs/common";

/**
 * @class {AppConsoleProvider}
 */
export class AppConsoleProvider
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
