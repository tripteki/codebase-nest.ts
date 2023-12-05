"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";

@Injectable ()
/**
 * @class
 */
export class AppService
{
    /**
     * @param {ConfigService} configService
     * @returns {void}
     */
    constructor (private readonly configService: ConfigService)
    {
        //
    }

    /**
     * @returns {string}
     */
    variable (): string
    {
        return this.configService.get<string> ("app.name") + ":" + this.configService.get<string> ("app.version");
    }
};
