"use strict";

import { Module, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { TypeOrmModule as DatabaseModule, } from "@nestjs/typeorm";
import { Logger as LogService, } from "@nestjs/common";
import { VersionEntity, } from "src/version/entity.version";
import { VersionService, } from "src/version/service.version";
import { VersionController, } from "src/version/controller.version";

@Module ({

    imports: [

        ConfigModule,
        DatabaseModule.forFeature ([

            VersionEntity,

        ], "postgreConnection"),
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
