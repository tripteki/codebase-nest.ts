"use strict";

import { Module, } from "@nestjs/common";
import { TypeOrmModule as DatabaseModule, } from "@nestjs/typeorm";
import { Logger as LogService, } from "@nestjs/common";
import { UserEntity, } from "src/v1/user/entities/entity.user";
import { UserAdminRepository, } from "src/v1/user/repositories/repository.admin.user";
import { UserAdminService, } from "src/v1/user/services/service.admin.user";
// import { UserService, } from "src/v1/user/services/service.user";
import { UserAdminController, } from "src/v1/user/controllers/controller.admin.user";
// import { UserController, } from "src/v1/user/controllers/controller.user";
import { SeederCommandUser, } from "src/v1/user/seeders/seeder.user";

@Module ({

    imports: [

        DatabaseModule.forFeature ([

            UserEntity,

        ], "postgreConnection"),
    ],

    providers: [

        LogService,
        // UserService,
        UserAdminService,
        UserAdminRepository,
        SeederCommandUser,
    ],

    controllers: [

        UserAdminController,
        // UserController,
    ],
})
/**
 * @class
 */
export class UserModule
{
    //
};
