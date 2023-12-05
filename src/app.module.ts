"use strict";

import { Module, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { ServeStaticModule, } from "@nestjs/serve-static";
import AppConfig from "../config/app";
import SwaggerConfig from "../config/swagger";
import { AppController, } from "./app.controller";
import { AppService, } from "./app.service";
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
    ],
    providers: [

        AppService,
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
