"use strict";

import { Module, } from "@nestjs/common";
import { ThrottlerModule, ThrottlerOptions, } from "@nestjs/throttler";
import { ConfigModule, } from "@nestjs/config";
import { ConfigService, } from "@nestjs/config";

@Module ({

    imports: [

        ThrottlerModule.forRootAsync ({

            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],

            useFactory: async (configService: ConfigService) => ({

                throttlers: await configService.get<ThrottlerOptions[]> ("throttle"),
            }),
        }),
    ],

    exports: [

        //
    ],
})
/**
 * @class
 */
export class AppThrottlerModule
{
    //
};
