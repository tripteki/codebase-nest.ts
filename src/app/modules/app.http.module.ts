"use strict";

import { Module, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { ThrottlerModule, ThrottlerModuleOptions, ThrottlerOptions, } from "@nestjs/throttler";
import { ServeStaticModule, ServeStaticModuleOptions, } from "@nestjs/serve-static";
import { GraphQLModule, } from "@nestjs/graphql";
import { TerminusModule, } from "@nestjs/terminus";
import { ConfigService, } from "@nestjs/config";
import { ApolloDriver, ApolloDriverConfig, } from "@nestjs/apollo";
import { AppController, } from "src/app/controllers/app.controller";
import { AppResolver, } from "src/app/resolvers/app.resolver";
import { join, } from "path";

@Module ({

    imports: [

        ConfigModule,

        TerminusModule,

        ServeStaticModule.forRootAsync ({

            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],

            useFactory: async (configService: ConfigService): Promise<ServeStaticModuleOptions[]> => ([

                {

                    rootPath: join (__dirname, "../../../", "public/"),
                    serveRoot: "/",
                    exclude: [

                        `/${configService.get<string> ("app.prefixApiUrl")}/*`,
                    ],
                }
            ]),
        }),

        GraphQLModule.forRootAsync<ApolloDriverConfig> ({

            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],

            driver: ApolloDriver,

            useFactory: async (configService: ConfigService): Promise<ApolloDriverConfig> => ({

                path: configService.get<string> ("app.prefixGraphqlUrl"),
                playground: configService.get<string> ("app.env") !== "production" ? {
                    subscriptionEndpoint: configService.get<string> ("app.prefixGraphqlUrl"),
                    endpoint: configService.get<string> ("playground.path"),
                } : false,
                autoSchemaFile: join (__dirname, "../", "resolvers/app.schema.graphql"),
                sortSchema: true,
                installSubscriptionHandlers: true,
            }),
        }),

        ThrottlerModule.forRootAsync ({

            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],

            useFactory: async (configService: ConfigService): Promise<ThrottlerModuleOptions> => ({

                throttlers: await configService.get<ThrottlerOptions[]> ("throttle"),
            }),
        }),
    ],

    exports: [

        //
    ],

    providers: [

        AppResolver,
    ],

    controllers: [

        AppController,
    ],
})
/**
 * @class {AppHttpModule}
 */
export class AppHttpModule
{
    //
};
