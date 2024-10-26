"use strict";

import { join, } from "path";
import "winston-daily-rotate-file";
import * as winston from "winston";
import * as Transport from "winston-transport";

/**
 * @interface
 */
interface LogOptionsFactory
{
    /**
     * @returns {Transport[]}
     */
    createLogOptions (): Transport[];
};

/**
 * @class
 * @implements {LogOptionsFactory}
 */
export class ConsoleDriverConfigService implements LogOptionsFactory
{
    /**
     * @returns {Transport[]}
     */
    createLogOptions (): Transport[]
    {
        return [

            new winston.transports.Console (),
        ];
    }
};

/**
 * @class
 * @implements {LogOptionsFactory}
 */
export class FileDriverConfigService implements LogOptionsFactory
{
    /**
     * @returns {Transport[]}
     */
    createLogOptions (): Transport[]
    {
        const dirname = join (__dirname, "../../../", "storage/logs/");

        return [

            new winston.transports.File ({

                dirname,
                filename: "nest.log",
            }),

            new winston.transports.DailyRotateFile ({

                dirname,
                filename: "nest-%DATE%.log",
                zippedArchive: true,
            }),
        ];
    }
};
