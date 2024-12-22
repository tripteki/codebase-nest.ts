"use strict";

import { Module, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { EventEmitterModule as EventListenerModule, } from "@nestjs/event-emitter";
import { ScheduleModule, } from "@nestjs/schedule";
import { BullRootModuleOptions, BullModule as QueueModule, } from "@nestjs/bull";
import { ConfigService, } from "@nestjs/config";
import { QueueOptions, } from "bull";
import { StringHelper, } from "src/app/helpers/string.helper";

@Module ({

    imports: [

        EventListenerModule.forRoot (),

        ScheduleModule.forRoot (),

        QueueModule.forRootAsync ({

            imports: [ ConfigModule, ],
            inject: [ ConfigService, StringHelper, ],

            useFactory: async (configService: ConfigService, stringHelper: StringHelper): Promise<BullRootModuleOptions> => ({

                ... (await configService.get<QueueOptions> ("queue")),

                redis: {

                    host: String (process.env.MEMORY_QUEUE_REDIS_HOST || process.env.MEMORY_REDIS_HOST),
                    port: Number (process.env.MEMORY_QUEUE_REDIS_PORT || process.env.MEMORY_REDIS_PORT),
                    username: String (process.env.MEMORY_QUEUE_REDIS_USERNAME || process.env.MEMORY_REDIS_USERNAME),
                    password: String (process.env.MEMORY_QUEUE_REDIS_PASSWORD || process.env.MEMORY_REDIS_PASSWORD),
                    db: Number (process.env.MEMORY_QUEUE_REDIS_DATABASE || process.env.MEMORY_REDIS_DATABASE),
                    keyPrefix: stringHelper.ref ().slug (configService.get<string> ("app.name"), "_") + "_queue_",
                },
            }),
        }),
    ],

    exports: [

        //
    ],
})
/**
 * @class {AppEventListenerModule}
 */
export class AppEventListenerModule
{
    //
};
