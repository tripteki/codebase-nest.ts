"use strict";

import { NestFastifyApplication, } from "@nestjs/platform-fastify";
import { ConfigService, } from "@nestjs/config";

/**
 * @abstract
 * @class
 */
export abstract class AppProvider
{
    /**
     * @type {NestFastifyApplication}
     */
    protected appService: NestFastifyApplication;

    /**
     * @type {NestFastifyApplication}
     */
    protected configService: NestFastifyApplication;

    /**
     * @returns {Promise<void>}
     */
    public abstract register (): Promise<void>;

    /**
     * @returns {Promise<void>}
     */
    public abstract boot (): Promise<void>;

    /**
     * @param {NestFastifyApplication} appService
     * @returns {void}
     */
    constructor (appService: NestFastifyApplication)
    {
        this.appService = appService;
        this.configService = appService.get (ConfigService);

        (async () => {

            await this.register ();
            await this.boot ();

        }) ();
    }
};
