"use strict";

import { Module, } from "@nestjs/common";
import { AppConfigModule, } from "src/app/modules/module.config";
import { AppAssetModule, } from "src/app/modules/module.asset";
import { AppI18nModule, } from "src/app/modules/module.i18n";
import { AppCacheModule, } from "src/app/modules/module.cache";
import { AppDatabaseModule, } from "src/app/modules/module.database";
import { AppMailModule, } from "src/app/modules/module.mail";
import { AppHealthModule, } from "src/app/modules/module.health";
import { VersionModule, } from "src/version/modules/module.version";

@Module ({

    imports: [

        AppConfigModule,
        AppAssetModule,
        AppI18nModule,
        AppCacheModule,
        AppDatabaseModule,
        AppMailModule,
        AppHealthModule,

        ... [

            VersionModule,
        ]
    ],

    providers: [

        //
    ],

    controllers: [

        //
    ],
})
/**
 * @class
 */
export class AppModule
{
    //
};
