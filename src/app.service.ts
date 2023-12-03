"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";

@Injectable ()
export class AppService
{
    constructor (private readonly configService: ConfigService)
    {
        //
    }

    variable (): string
    {
        return this.configService.get<string> ("app.name") + ":" + this.configService.get<string> ("app.version");
    }
};
