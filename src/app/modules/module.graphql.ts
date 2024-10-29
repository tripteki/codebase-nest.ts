"use strict";

import { Module, } from "@nestjs/common";
import { GraphQLModule, } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig, } from "@nestjs/apollo";
import { ConfigModule, } from "@nestjs/config";
import { ConfigService, } from "@nestjs/config";

@Module ({

    imports: [

        GraphQLModule.forRootAsync<ApolloDriverConfig> ({

            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],

            driver: ApolloDriver,

            useFactory: (configService: ConfigService) => ({

                autoSchemaFile: true,
                playground: configService.get<string> ("app.env") !== "production",
            }),
        }),
    ],

    exports: [

        //
    ],
})
/**
 * @class
 */
export class AppGraphqlModule
{
    //
};
