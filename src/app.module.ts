"use strict";

import { Module, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import AppConfig from "../config/app";
import { AppController, } from "./app.controller";
import { AppService, } from "./app.service";

@Module ({

    imports: [

        ConfigModule.forRoot ({

            cache: true,
            expandVariables: true,
            load: [

                AppConfig,
            ],
        }),
    ],
    providers: [

        AppService,
    ],
    controllers: [

        AppController,
    ],
})
export class AppModule
{
    //
};
