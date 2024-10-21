"use strict";

import { AppProvider, } from "src/app/provider";
import { LogConfigService, } from "src/app/config.log";
import { WinstonModule as LogModule, } from "nest-winston";

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
                await (new LogConfigService ()).createWinstonModuleOptions ()
            )
        );
    }
};
