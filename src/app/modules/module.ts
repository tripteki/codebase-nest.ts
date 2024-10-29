"use strict";

import { Module, } from "@nestjs/common";
import { AppThreadModule, } from "src/app/modules/module.thread";
import { AppConfigModule, } from "src/app/modules/module.config";
import { AppAssetModule, } from "src/app/modules/module.asset";
import { AppI18nModule, } from "src/app/modules/module.i18n";
import { AppCacheModule, } from "src/app/modules/module.cache";
import { AppDatabaseModule, } from "src/app/modules/module.database";
import { AppMailModule, } from "src/app/modules/module.mail";
import { AppHealthModule, } from "src/app/modules/module.health";
import { AppThrottlerModule, } from "src/app/modules/module.throttle";
import { AppEventListenerModule, } from "src/app/modules/module.event-listener";
import { AppGraphqlModule, } from "src/app/modules/module.graphql";
import { CommonModule, } from "src/v1/common/modules/module";
import { AppController, } from "src/app/controllers/controller";

@Module ({

    imports: [

        AppConfigModule,
        AppAssetModule,
        AppI18nModule,
        AppCacheModule,
        AppDatabaseModule,
        AppMailModule,
        AppHealthModule,
        AppThrottlerModule,
        AppEventListenerModule,
        AppGraphqlModule,

        ... [

            CommonModule,
        ],
    ],

    providers: [

        //
    ],

    controllers: [

        AppController,
    ],
})
/**
 * @class
 */
export class AppModule
{
    //
};
