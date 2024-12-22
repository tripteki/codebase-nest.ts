"use strict";

import { Module, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { ConfigService, } from "@nestjs/config";
import AppConfig from "src/app/configs/app.config";
import QueueConfig from "src/app/configs/queue.config";
import ThrottleConfig from "src/app/configs/throttle.config";
import HashConfig from "src/app/configs/hash.config";
import AuthConfig from "src/app/configs/auth.config";
import LogConfig from "src/app/configs/log.config";
import MailConfig from "src/app/configs/mail.config";
import StorageConfig from "src/app/configs/storage.config";
import SwaggerConfig from "src/app/configs/swagger.config";
import PlaygroundConfig from "src/app/configs/playground.config";

@Module ({

    imports: [

        ConfigModule.forRoot ({

            cache: true,
            expandVariables: true,
        
            load: [
        
                AppConfig,
                QueueConfig,
                ThrottleConfig,
                HashConfig,
                AuthConfig,
                LogConfig,
                MailConfig,
                StorageConfig,
                SwaggerConfig,
                PlaygroundConfig,
            ],
        }),
    ],

    exports: [

        ConfigService,
    ],

    providers: [

        ConfigService,
    ],
})
/**
 * @class {AppConfigModule}
 */
export class AppConfigModule
{
    //
};
