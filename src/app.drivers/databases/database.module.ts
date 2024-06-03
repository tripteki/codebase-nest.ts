"use strict";

import { Module, } from "@nestjs/common";
import { PrismaMongodbDriverConfigService, } from "./mongodb.driver.config.service";
import { PrismaPgsqlDriverConfigService, } from "./pgsql.driver.config.service";

@Module ({

    providers: [

        PrismaMongodbDriverConfigService,
        PrismaPgsqlDriverConfigService,
    ],
})
/**
 * @class
 */
export class DatabaseModule
{
    //
};
