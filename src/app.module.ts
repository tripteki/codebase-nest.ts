"use strict";

import { Module, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { ServeStaticModule, } from "@nestjs/serve-static";
import { CacheModule, } from "@nestjs/cache-manager";
import { RedisDriverConfigService, } from "src/caches/redis.driver.config.service";
import AppConfig from "../config/app";
import SwaggerConfig from "../config/swagger";
import { join, } from "path";

@Module ({

    imports: [

        ConfigModule.forRoot ({

            cache: true,
            expandVariables: true,
            load: [

                AppConfig,
                SwaggerConfig,
            ],
        }),

        ServeStaticModule.forRoot ({

            rootPath: join (__dirname, "../../", "public/"),
            serveRoot: "/web",
            exclude: [ "/api/*", ],
        }),

        CacheModule.registerAsync ({

            isGlobal: true,
            useClass: RedisDriverConfigService,
        }),
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
