"use strict";

import { join, } from "path";
import { Module, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { ServeStaticModule, } from "@nestjs/serve-static";
import { VersionModule, } from "src/version/module";
import AppConfig from "src/app/config.app";
import SwaggerConfig from "src/app/config.swagger";

@Module ({

    imports: [

        ConfigModule.forRoot ({

            cache: false,
            expandVariables: true,
            load: [

                AppConfig,
                SwaggerConfig,
            ],
        }),

        ServeStaticModule.forRoot ({

            rootPath: join (__dirname, "../../", "public/"),
            serveRoot: "/",
            exclude: [

                "/api/*",
            ],
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
