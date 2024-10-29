"use strict";

import { Module, } from "@nestjs/common";
import { NestjsQueryGraphQLModule, } from "@nestjs-query/query-graphql";
import { NestjsQueryTypeOrmModule, } from "@nestjs-query/query-typeorm";
import { SeederCommandUser, } from "src/v1/user/seeders/seeder.user";
import { UserEntity, } from "src/v1/user/entities/entity.user";
import { UserAdminServiceGraphql, } from "../services/graphql.service.admin.user";
import { UserAdminRequestDto, } from "src/v1/user/requests/dto.request.admin.user";
import { UserAdminResponseDto, } from "src/v1/user/responses/dto.response.admin.user";

@Module ({

    imports: [

        NestjsQueryGraphQLModule.forFeature ({

            imports: [

                NestjsQueryTypeOrmModule.forFeature ([

                    UserEntity,

                ], "postgreConnection"),
            ],

            services: [

                UserAdminServiceGraphql,
            ],

            resolvers: [

                {
                    EntityClass: UserEntity,
                    ServiceClass: UserAdminServiceGraphql,
                    DTOClass: UserAdminResponseDto,
                },
            ],
        }),
    ],

    providers: [

        SeederCommandUser,
    ],

    controllers: [

        //
    ],
})
/**
 * @class
 */
export class UserModule
{
    //
};
