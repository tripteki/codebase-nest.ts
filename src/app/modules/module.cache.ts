"use strict";

import { Module, } from "@nestjs/common";
import { CacheModule, } from "@nestjs/cache-manager";
import { RedisDriverConfigService, } from "src/app/drivers/driver.cache";
import { ConfigModule, } from "@nestjs/config";
import { ConfigService, } from "@nestjs/config";

@Module ({

    imports: [

        CacheModule.registerAsync ({

            isGlobal: true,
            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],
            useClass: RedisDriverConfigService,
        }),
    ],

    exports: [

        //
    ],
})
/**
 * @class
 */
export class AppCacheModule
{
    //
};
