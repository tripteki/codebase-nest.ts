"use strict";

import { Module, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { Logger as LogService, } from "@nestjs/common";
import { VersionService, } from "src/version/service";
import { VersionController, } from "src/version/controller";

@Module ({

    imports: [

        ConfigModule,
    ],

    providers: [

        LogService,
        VersionService,
    ],

    controllers: [

        VersionController,
    ],
})
/**
 * @class
 */
export class VersionModule
{
    //
};
