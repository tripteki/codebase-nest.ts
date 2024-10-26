"use strict";

import { Module, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { TypeOrmModule as DatabaseModule, } from "@nestjs/typeorm";
import { Logger as LogService, } from "@nestjs/common";
import { VersionEntity, } from "src/version/entities/entity.version";
import { VersionService, } from "src/version/services/service.version";
import { VersionController, } from "src/version/controllers/controller.version";
import { SeederCommandVersion, } from "src/version/seeders/seeder.version";

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

        SeederCommandVersion,
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
