"use strict";

import { Module, } from "@nestjs/common";
import { AppConfigModule, } from "src/app/modules/app.config.module";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { AppEventListenerModule, } from "src/app/modules/app.eventlistener.module";
import { AppI18NModule, } from "src/app/modules/app.i18n.module";
import { AppCacheModule, } from "src/app/modules/app.cache.module";
import { AppDatabaseModule, } from "src/app/modules/app.database.module";
import { AppMailModule, } from "src/app/modules/app.mail.module";
import { AppConsoleModule, } from "src/app/modules/app.console.module";
import { AppHttpModule, } from "src/app/modules/app.http.module";
import { AppAuthModule, } from "src/app/modules/app.auth.module";

import { V1Module, } from "src/v1/module";

@Module ({

    imports: [

        AppConfigModule,
        AppHelperModule,
        AppEventListenerModule,
        AppI18NModule,
        AppCacheModule,
        AppDatabaseModule,
        AppMailModule,
        AppConsoleModule,
        AppHttpModule,
        AppAuthModule,

        ... [

            V1Module,
        ],
    ],

    exports: [

        //
    ],
})
/**
 * @class {AppModule}
 */
export class AppModule
{
    //
};
