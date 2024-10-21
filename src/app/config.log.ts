"use strict";

import { ConsoleDriverConfigService, FileDriverConfigService, } from "src/app/driver.log";
import { Injectable, } from "@nestjs/common";
import { WinstonModuleOptionsFactory, WinstonModuleOptions, } from "nest-winston";
import * as winston from "winston";

@Injectable ()
/**
 * @class
 * @implements {WinstonModuleOptionsFactory}
 */
export class LogConfigService implements WinstonModuleOptionsFactory
{
    /**
     * @returns {Promise<WinstonModuleOptions> | WinstonModuleOptions}
     */
    public createWinstonModuleOptions (): Promise<WinstonModuleOptions> | WinstonModuleOptions
    {
        return {

            handleExceptions: true,

            level: String (process.env.LOG_LEVEL || "debug"),

            format: winston.format.combine (

                winston.format.simple (),
                winston.format.timestamp (),
                winston.format.errors ({ stack: true, }),
            ),

            transports: [

                ... (new ConsoleDriverConfigService ()).createLogOptions (),
                ... (new FileDriverConfigService ()).createLogOptions (),
            ],
        };
    }
};
