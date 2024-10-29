"use strict";

import { NestFactory, } from "@nestjs/core";
import { NestExpressApplication, } from "@nestjs/platform-express";
import { ConfigService, } from "@nestjs/config";
import { AppThreadProvider, } from "src/app/providers/provider.thread";
import { AppInstanceProvider, } from "src/app/providers/provider.instance";
import { AppSecurityCorsProvider, } from "src/app/providers/provider.security.cors";
import { AppSecurityCsrfProvider, } from "src/app/providers/provider.security.csrf";
import { AppSecurityHelmetProvider, } from "src/app/providers/provider.security.helmet";
import { AppLoggerProvider, } from "src/app/providers/provider.logger";
import { AppI18nProvider, } from "src/app/providers/provider.i18n";
import { AppSwaggerProvider, } from "src/app/providers/provider.swagger";
import { AppModule, } from "src/app/modules/module";

/**
 * @returns {Promise<void>}
 */
(new AppThreadProvider).register (async () =>
{
    const

    app = await NestFactory.create<NestExpressApplication> (
        AppModule
    ),

    configService = app.get (
        ConfigService
    );

    (new AppLoggerProvider (app));
    (new AppSecurityHelmetProvider (app));
    (new AppSecurityCorsProvider (app));
    (new AppInstanceProvider (app));
    (new AppSwaggerProvider (app));

    await app.listen (
        configService.get<number> ("app.port"),
        configService.get<string> ("app.host")
    );

});
