"use strict";

import { INestApplication, Logger, } from "@nestjs/common";
import { AppProviderContract, } from "src/app/contracts/app.provider.contract";

/**
 * @class {AppReplProvider}
 * @implements {AppProviderContract}
 */
export class AppReplProvider
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
};
