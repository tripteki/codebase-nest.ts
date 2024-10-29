"use strict";

import { Module, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import AppConfig from "src/app/configs/config.app";
import SwaggerConfig from "src/app/configs/config.swagger";
import LogConfig from "src/app/configs/config.log";
import MailConfig from "src/app/configs/config.mail";
import CacheConfig from "src/app/configs/config.cache";
import DatabaseConfig from "src/app/configs/config.database";
import HashConfig from "src/app/configs/config.hash";
import ThrottleConfig from "src/app/configs/config.throttle";

@Module ({

    imports: [

        ConfigModule.forRoot ({

            cache: true,
            expandVariables: true,
            load: [

                AppConfig,
                SwaggerConfig,
                LogConfig,
                MailConfig,
                CacheConfig,
                DatabaseConfig,
                ThrottleConfig,
            ],
        }),
    ],

    exports: [

        //
    ],
})
/**
 * @class
 */
export class AppConfigModule
{
    //
};
