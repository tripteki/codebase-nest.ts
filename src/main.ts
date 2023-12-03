"use strict";

import { NestFactory, } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication, } from "@nestjs/platform-fastify";
import { AppModule, } from "./app.module";

(async () =>
{
    const initialization = await NestFactory.create<NestFastifyApplication> (

        AppModule,
        new FastifyAdapter (),
    );

    await initialization.
    listen (3000);
}) ();
