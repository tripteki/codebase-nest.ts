"use strict";

import { Module, } from "@nestjs/common";
import { PrismaMongodbDriverConfigService, } from "./mongodb.driver.config.service";
import { PrismaMysqlDriverConfigService, } from "./mysql.driver.config.service";

@Module ({

    providers: [

        PrismaMongodbDriverConfigService,
        PrismaMysqlDriverConfigService,
    ],
})
/**
 * @class
 */
export class DatabaseModule
{
    //
};
