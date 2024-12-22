"use strict";

import { INestApplication, Logger, } from "@nestjs/common";
import { ProviderContract, } from "src/app/contracts/provider.contract";

/**
 * @class {AppConsoleProvider}
 * @implements {ProviderContract}
 */
export class AppConsoleProvider
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
