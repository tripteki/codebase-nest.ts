"use strict";

import { INestApplication, } from "@nestjs/common";
import { WinstonModule as LogModule, } from "nest-winston";
import { ConfigService, } from "@nestjs/config";
import { LogDriver, } from "src/app/drivers/log.driver";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";

/**
 * @class {AppLogProvider}
 * @implements {AppProviderContract}
 */
export class AppLogProvider
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
        AppLogProvider.bootLog (app);
    }

    /**
     * @param {INestApplication} app
     * @returns {void | Promise<void>}
     */
    public static async bootLog (app): Promise<void>
    {
        const

        configService: ConfigService = app.get (
            ConfigService
        ),
        datetimeHelper: DateTimeHelper = app.get (
            DateTimeHelper
        );

        app.useLogger (
            LogModule.createLogger (
                await (new LogDriver (configService, datetimeHelper).createWinstonModuleOptions ())
            )
        );
    }
};
