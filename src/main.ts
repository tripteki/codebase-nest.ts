"use strict";

import { NestFactory, } from "@nestjs/core";
import { INestApplication, } from "@nestjs/common";
import { NestExpressApplication, } from "@nestjs/platform-express";
import { AppLogProvider, } from "src/app/providers/app.log.provider";
import { AppI18NProvider, } from "src/app/providers/app.i18n.provider";
import { AppHttpProvider, } from "src/app/providers/app.http.provider";
import { AppConsoleProvider, } from "src/app/providers/app.console.provider";
import { AppApiProvider, } from "src/app/providers/app.api.provider";
import { AppGraphqlProvider, } from "src/app/providers/app.graphql.provider";
import { AppReplProvider, } from "src/app/providers/app.repl.provider";
import { AppViewProvider, } from "src/app/providers/app.view.provider";
import { AppModule, } from "src/app/modules/app.module";

/**
 * @returns {Promise<INestApplication>}
 */
AppHttpProvider.register (async (): Promise<INestApplication> =>
{
    const

    app = await NestFactory.create<NestExpressApplication> (
        AppModule
    );

    //: Start Define Service Providers //

    AppLogProvider.boot (app);
    AppI18NProvider.boot (app);
    AppHttpProvider.boot (app);
    AppApiProvider.boot (app);
    AppGraphqlProvider.boot (app);
    AppViewProvider.boot (app);

    //: End Define Service Providers //

    return app;
});
