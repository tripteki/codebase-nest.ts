"use strict";

import { Injectable, Logger as LogService, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";

@Injectable ()
/**
 * @class
 */
export class VersionService
{
    /**
     * @param {ConfigService} configService
     * @param {LogService} logService
     * @returns {void}
     */
    constructor (
        private readonly configService: ConfigService,
        private readonly logService: LogService
    )
    {
        //
    }

    /**
     * @returns {string}
     */
    variable (): string
    {
        const version: string = this.configService.get<string> ("app.name") + ":" + this.configService.get<string> ("app.version");

        this.logService.log (version);

        return version;
    }
};
