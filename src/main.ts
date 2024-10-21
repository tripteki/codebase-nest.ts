"use strict";

import { NestFactory, } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication, } from "@nestjs/platform-fastify";
import { ConfigService, } from "@nestjs/config";
import { AppInstanceProvider, } from "src/app/provider.instance";
import { AppSecurityCorsProvider, } from "src/app/provider.security.cors";
import { AppSecurityCsrfProvider, } from "src/app/provider.security.csrf";
import { AppSecurityHelmetProvider, } from "src/app/provider.security.helmet";
import { AppLoggerProvider, } from "src/app/provider.logger";
import { AppSwaggerProvider, } from "src/app/provider.swagger";
import { AppModule, } from "src/app/module";

/**
 * @returns {Promise<void>}
 */
(async () =>
{
    const

    app = await NestFactory.create<NestFastifyApplication> (
        AppModule,
        new FastifyAdapter ()
    ),

    configService = app.get (
        ConfigService
    );

    (new AppLoggerProvider (app));
    // (new AppSecurityCsrfProvider (app)); //
    // (new AppSecurityHelmetProvider (app)); //
    (new AppSecurityCorsProvider (app));
    (new AppInstanceProvider (app));
    (new AppSwaggerProvider (app));

    await app.listen (
        configService.get<number> ("app.port"),
        configService.get<string> ("app.host")
    );

}) ();
