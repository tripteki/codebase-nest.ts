"use strict";

import { join, } from "path";
import { Module, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { ServeStaticModule, } from "@nestjs/serve-static";
import { CacheModule, } from "@nestjs/cache-manager";
import { TypeOrmModule as DatabaseModule, } from "@nestjs/typeorm";
import { I18nModule, } from "nestjs-i18n";
import { VersionModule, } from "src/version/modules/module.version";
import { ConfigService, } from "@nestjs/config";
import { I18nDriverConfigService, } from "src/app/drivers/driver.i18n";
import { RedisDriverConfigService, } from "src/app/drivers/driver.cache";
import { MongoDriverConfigService, PostgreDriverConfigService, MariaDriverConfigService, } from "src/app/drivers/driver.database";
import AppConfig from "src/app/configs/config.app";
import SwaggerConfig from "src/app/configs/config.swagger";
import LogConfig from "src/app/configs/config.log";
import CacheConfig from "src/app/configs/config.cache";
import DatabaseConfig from "src/app/configs/config.database";

@Module ({

    imports: [

        ConfigModule.forRoot ({

            cache: true,
            expandVariables: true,
            load: [

                AppConfig,
                SwaggerConfig,
                LogConfig,
                CacheConfig,
                DatabaseConfig,
            ],
        }),

        ServeStaticModule.forRoot ({

            rootPath: join (__dirname, "../../../", "public/"),
            serveRoot: "/",
            exclude: [

                "/api/*",
            ],
        }),

        I18nModule.forRootAsync ({

            resolvers: I18nDriverConfigService.createI18nResolvers (),
            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],

            useFactory: async (configService: ConfigService) => ({

                ... (await (new I18nDriverConfigService (configService).createI18nOptions ())),
            }),
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
