"use strict";

import { NestFactory, } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication, } from "@nestjs/platform-fastify";
import { ConfigService, } from "@nestjs/config";
import { AppModule, } from "./app.module";

(async () =>
{
    const initialization = await NestFactory.create<NestFastifyApplication> (

        AppModule,
        new FastifyAdapter (),
    );

    const configService = initialization.get (ConfigService);

    await initialization.
    listen (configService.get<number> ("app.port"), configService.get<string> ("app.host"));
}) ();
