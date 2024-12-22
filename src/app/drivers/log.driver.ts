"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { WinstonModuleOptionsFactory, WinstonModuleOptions, } from "nest-winston";
import { join, } from "path";
import * as winston from "winston";
import * as Transport from "winston-transport";
import "winston-daily-rotate-file";
import winstonElasticSearch from "winston-elasticsearch";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";

/**
 * @class {LogDriver}
 * @implements {WinstonModuleOptionsFactory}
 */
export class LogDriver implements WinstonModuleOptionsFactory
{
    /**
     * @param {ConfigService} configService
     * @param {DateTimeHelper} datetimeHelper
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        private readonly datetimeHelper: DateTimeHelper
    )
    {
        //
    }

    /**
     * @returns {Promise<WinstonModuleOptions>}
     */
    public async createWinstonModuleOptions (): Promise<WinstonModuleOptions>
    {
        return {

            handleExceptions: true,

            format: winston.format.combine (

                winston.format.errors ({ stack: true, }),
                winston.format.timestamp ({ format: this.datetimeHelper.nowString (), }),
                winston.format.logstash ()
            ),

            ... this.configService.get<winston.LoggerOptions> ("log"),
        };
    }
};

/**
 * @interface {LogOptionsFactory}
 */
interface LogOptionsFactory
{
    /**
     * @returns {Transport[]}
     */
    createLogOptions (): Transport[];
};

/**
 * @class {LogConsoleDriver}
 * @implements {LogOptionsFactory}
 */
export class LogConsoleDriver
{
    /**
     * @returns {Transport[]}
     */
    public static createLogOptions (): Transport[]
    {
        return [

            new winston.transports.Console (),
        ];
    }
};

/**
 * @class {LogFileDriver}
 * @implements {LogOptionsFactory}
 */
export class LogFileDriver
{
    /**
     * @returns {Transport[]}
     */
    public static createLogOptions (): Transport[]
    {
        const dirname: string = join (__dirname, "../../../", "storage/logs/");

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

/**
 * @class {LogElasticDriver}
 * @implements {LogOptionsFactory}
 */
export class LogElasticDriver
{
    /**
     * @returns {Transport[]}
     */
    public static createLogOptions (): Transport[]
    {
        return [

            new winstonElasticSearch.ElasticsearchTransport ({

                clientOpts: {

                    node: String (process.env.LOG_ELASTICSEARCH_URI),
                },
            }),
        ];
    }
};
