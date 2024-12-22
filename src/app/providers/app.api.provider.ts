"use strict";

import { INestApplication, } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder as SwaggerBuilder, } from "@nestjs/swagger";
import { ConfigService, } from "@nestjs/config";

/**
 * @class {AppApiProvider}
 * @implements {AppProviderContract}
 */
export class AppApiProvider
{
    /**
     * @param {(() => INestApplication | Promise<INestApplication>)} app
     * @returns {void | Promise<void>}
     */
    public static async register (app: (() => INestApplication | Promise<INestApplication>)): Promise<void>
    {
        //
    }

    /**
     * @param {INestApplication} app
     * @returns {void | Promise<void>}
     */
    public static async boot (app: INestApplication): Promise<void>
    {
        AppApiProvider.bootSwagger (app);
    }

    /**
     * @param {INestApplication} app
     * @returns {void | Promise<void>}
     */
    public static async bootSwagger (app): Promise<void>
    {
        const configService: ConfigService = app.get (
            ConfigService
        );

        if (configService.get<string> ("app.env") !== "production") {

            const

            swaggerService = SwaggerModule.createDocument (app, ((new SwaggerBuilder ()).
                setTitle (configService.get<string> ("swagger.title")).
                setDescription (configService.get<string> ("swagger.description")).
                setVersion (configService.get<string> ("swagger.version")).
                addBearerAuth ().
                addTag ("Stats").
                addTag ("UserAuth").
                addTag ("UserAdmin").
                addTag ("NotificationUser").
                addTag ("NotificationAdmin")
            .build ()));

            SwaggerModule.setup (`/${configService.get<string> ("app.prefixApiUrl")}/` + configService.get<string> ("swagger.path"),
                app,
                swaggerService
            );
        }
    }
};
