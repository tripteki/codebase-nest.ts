"use strict";

import { Module, } from "@nestjs/common";
import { TypeOrmModule as DatabaseModule, } from "@nestjs/typeorm";
import { MongoDriverConfigService, PostgreDriverConfigService, MariaDriverConfigService, } from "src/app/drivers/driver.database";
import { ConfigModule, } from "@nestjs/config";
import { ConfigService, } from "@nestjs/config";

@Module ({

    imports: [

        DatabaseModule.forRootAsync ({

            name: "mongoConnection",
            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],
            useClass: MongoDriverConfigService,
        }),

        DatabaseModule.forRootAsync ({

            name: "postgreConnection",
            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],
            useClass: PostgreDriverConfigService,
        }),

        DatabaseModule.forRootAsync ({

            name: "mariaConnection",
            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],
            useClass: MariaDriverConfigService,
        }),
    ],

    exports: [

        //
    ],
})
/**
 * @class
 */
export class AppDatabaseModule
{
    //
};
