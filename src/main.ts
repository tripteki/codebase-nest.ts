"use strict";

import { NestFactory, } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication, } from "@nestjs/platform-fastify";
import { ConfigService, } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder as SwaggerBuilder, } from "@nestjs/swagger";
import { AppModule, } from "./app.module";

/**
 * @returns {void}
 */
(async () =>
{
    const initialization = await NestFactory.create<NestFastifyApplication> (

        AppModule,
        new FastifyAdapter (),
    );

    initialization.setGlobalPrefix ("api");

    const configService = initialization.get (ConfigService),
    swaggerService = SwaggerModule.createDocument (initialization, ((new SwaggerBuilder ()).
        setTitle (configService.get<string> ("swagger.title")).
        setDescription (configService.get<string> ("swagger.description")).
        setVersion (configService.get<string> ("swagger.version"))
    .build ()));

    SwaggerModule.setup ("api/" + configService.get<string> ("swagger.path"), initialization, swaggerService);

    await initialization.
    listen (configService.get<number> ("app.port"), configService.get<string> ("app.host"));
}) ();
