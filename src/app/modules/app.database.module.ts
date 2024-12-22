"use strict";

import { Module, Global, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { ConfigService, } from "@nestjs/config";
import { DatabasePrismaPostgreDriver, DatabasePrismaMongoDriver, } from "src/app/drivers/database.driver";

@Global ()
@Module ({

    imports: [

        //
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
