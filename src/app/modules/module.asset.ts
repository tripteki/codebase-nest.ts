"use strict";

import { join, } from "path";
import { Module, } from "@nestjs/common";
import { ServeStaticModule, } from "@nestjs/serve-static";

@Module ({

    imports: [

        ServeStaticModule.forRoot ({

            rootPath: join (__dirname, "../../../", "public/"),
            serveRoot: "/",
            exclude: [

                "/api/*",
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
export class AppAssetModule
{
    //
};
