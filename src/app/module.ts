"use strict";

import { join, } from "path";
import { Module, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { ServeStaticModule, } from "@nestjs/serve-static";
import { CacheModule, } from "@nestjs/cache-manager";
import { TypeOrmModule as DatabaseModule, } from "@nestjs/typeorm";
import { VersionModule, } from "src/version/module.version";
import { ConfigService, } from "@nestjs/config";
import { RedisDriverConfigService, } from "src/app/driver.cache";
import { MongoDriverConfigService, PostgreDriverConfigService, MariaDriverConfigService, } from "src/app/driver.database";
import AppConfig from "src/app/config.app";
import SwaggerConfig from "src/app/config.swagger";
import CacheConfig from "src/app/config.cache";
import DatabaseConfig from "src/app/config.database";

@Module ({

    imports: [

        ConfigModule.forRoot ({

            cache: true,
            expandVariables: true,
            load: [

                AppConfig,
                SwaggerConfig,
                CacheConfig,
                DatabaseConfig,
            ],
        }),

        ServeStaticModule.forRoot ({

            rootPath: join (__dirname, "../../", "public/"),
            serveRoot: "/",
            exclude: [

                "/api/*",
            ],
        }),

        CacheModule.registerAsync ({

            isGlobal: true,
            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],
            useClass: RedisDriverConfigService,
        }),

        DatabaseModule.forRootAsync ({

            name: "mongoConnection",
            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],
            useClass: MongoDriverConfigService,
        }),

        DatabaseModule.forRootAsync ({

            name: "postgreConnection",
            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],
            useClass: PostgreDriverConfigService,
        }),

        DatabaseModule.forRootAsync ({

            name: "mariaConnection",
            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],
            useClass: MariaDriverConfigService,
        }),

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
