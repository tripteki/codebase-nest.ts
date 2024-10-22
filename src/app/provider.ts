"use strict";

import { INestApplication as NestExpressApplication, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";

/**
 * @abstract
 * @class
 */
export abstract class AppProvider
{
    /**
     * @type {NestExpressApplication}
     */
    protected appService: NestExpressApplication;

    /**
     * @type {NestExpressApplication}
     */
    protected configService: NestExpressApplication;

    /**
     * @returns {Promise<void>}
     */
    public abstract register (): Promise<void>;

    /**
     * @returns {Promise<void>}
     */
    public abstract boot (): Promise<void>;

    /**
     * @param {NestExpressApplication} appService
     * @returns {void}
     */
    constructor (appService: NestExpressApplication)
    {
        this.appService = appService;
        this.configService = appService.get (ConfigService);

        (async () => {

            await this.register ();
            await this.boot ();

        }) ();
    }
};
