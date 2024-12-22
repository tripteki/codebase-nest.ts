"use strict";

import { Module, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { CacheModule, } from "@nestjs/cache-manager";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { ConfigService, } from "@nestjs/config";
import { MemoryRedisDriver, } from "src/app/drivers/cache.driver";
import { StringHelper, } from "src/app/helpers/string.helper";

@Module ({

    imports: [

        AppHelperModule,

        CacheModule.registerAsync ({

            isGlobal: true,
            imports: [ ConfigModule, ],
            inject: [ ConfigService, StringHelper, ],
            useClass: MemoryRedisDriver,
        }),
    ],

    exports: [

        //
    ],
})
/**
 * @class {AppCacheModule}
 */
export class AppCacheModule
{
    //
};
