"use strict";

import { Module, Global, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { ConfigService, } from "@nestjs/config";
import { DatabasePrismaPostgreDriver, DatabasePrismaMongoDriver, } from "src/app/drivers/database.driver";

@Global ()
@Module ({

    imports: [

        AppHelperModule,
    ],

    exports: [

        DatabasePrismaPostgreDriver,
        DatabasePrismaMongoDriver,
    ],

    providers: [

        DatabasePrismaPostgreDriver,
        DatabasePrismaMongoDriver,
    ],
})
/**
 * @class {AppDatabaseModule}
 */
export class AppDatabaseModule
{
    //
};
