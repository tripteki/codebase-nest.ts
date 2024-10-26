"use strict";

import { AppProvider, } from "src/app/providers/provider";
import { INestApplication as NestExpressApplication, } from "@nestjs/common";
import { WinstonModule as LogModule, } from "nest-winston";
import { WinstonModuleOptionsFactory, WinstonModuleOptions, } from "nest-winston";

/**
 * @class
 * @implements {WinstonModuleOptionsFactory}
 */
class LogConfigService implements WinstonModuleOptionsFactory
{
    /**
     * @param {NestExpressApplication} configService
     * @returns {void}
     */
    constructor (
        private readonly configService: NestExpressApplication
    )
    {
        //
    }

    /**
     * @returns {Promise<WinstonModuleOptions>|WinstonModuleOptions}
     */
    public createWinstonModuleOptions (): Promise<WinstonModuleOptions>|WinstonModuleOptions
    {
        return {

            handleExceptions: true,

            ... this.configService.get<Object> ("log"),
        };
    }
};

/**
 * @class
 * @extends {AppProvider}
 */
export class AppLoggerProvider extends AppProvider
{
    /**
     * @returns {Promise<void>}
     */
    public async register (): Promise<void>
    {
        //
    }

    /**
     * @returns {Promise<void>}
     */
    public async boot (): Promise<void>
    {
        this.appService.useLogger (
            LogModule.createLogger (
                await (new LogConfigService (this.configService)).createWinstonModuleOptions ()
            )
        );
    }
};
