"use strict";

import { INestApplication, Logger as LoggerService, VersioningType, ValidationPipe, } from "@nestjs/common";
import { useContainer, } from "class-validator";
import { ConfigService, } from "@nestjs/config";
import { CorsOptions, } from "@nestjs/common/interfaces/external/cors-options.interface";
import { AppProviderContract, } from "src/app/contracts/app.provider.contract";
import { AppModule, } from "src/app/modules/app.module";
import os from "os";
import cluster from "cluster";
import { DoubleCsrfUtilities, doubleCsrf, } from "csrf-csrf";
import helmet from "helmet";
import compression from "compression";

/**
 * @class {AppHttpProvider}
 * @implements {AppProviderContract}
 */
export class AppHttpProvider
{
    /**
     * @param {(() => INestApplication | Promise<INestApplication>)} app
     * @returns {void | Promise<void>}
     */
    public static async register (app: (() => INestApplication | Promise<INestApplication>)): Promise<void>
    {
        const appRegistrar: INestApplication = await app (),
        configService: ConfigService = appRegistrar.get (
            ConfigService
        );

        if (configService.get<string> ("app.env") === "production") {

            if (cluster.isPrimary) {

                LoggerService.log (`Thread.pid.manager.${process.pid}!`);

                let i: number = 0;

                for (; i < os.cpus ().length; i++) {

                    cluster.fork ();
                }

                cluster.on ("exit", (worker) => {

                    LoggerService.log (`Thread.pid.worker.${worker.process.pid}!`);

                    cluster.fork ();
                });

            } else {

                LoggerService.log (`Thread.pid.clustered.${process.pid}!`);

                await appRegistrar.listen (
                    configService.get<number> ("app.port"),
                    configService.get<string> ("app.host")
                );
            }

        } else {

            await appRegistrar.listen (
                configService.get<number> ("app.port"),
                configService.get<string> ("app.host")
            );
        }
    }

    /**
     * @param {INestApplication} app
     * @returns {void | Promise<void>}
     */
    public static async boot (app: INestApplication): Promise<void>
    {
        AppHttpProvider.bootCors (app);
        AppHttpProvider.bootCsrf (app);
        AppHttpProvider.bootHelmet (app);
        AppHttpProvider.bootCompression (app);
        AppHttpProvider.bootRoute (app);
        AppHttpProvider.bootValidation (app);
    }

    /**
     * @param {INestApplication} app
     * @returns {void | Promise<void>}
     */
    public static async bootCors (app: INestApplication): Promise<void>
    {
        const configService: ConfigService = app.get (
            ConfigService
        );

        app.enableCors (
            configService.get<CorsOptions> ("app.cors")
        );
    }

    /**
     * @param {INestApplication} app
     * @returns {void | Promise<void>}
     */
    public static async bootCsrf (app: INestApplication): Promise<void>
    {
        const configService: ConfigService = app.get (
            ConfigService
        ),

        {
            generateToken,
            validateRequest,
            doubleCsrfProtection,
            invalidCsrfTokenError,

        }: DoubleCsrfUtilities = doubleCsrf (
        {
            getSecret: null,
        });

        if (configService.get<string> ("app.env") === "production") app.use (
            doubleCsrfProtection
        );
    }

    /**
     * @param {INestApplication} app
     * @returns {void | Promise<void>}
     */
    public static async bootHelmet (app: INestApplication): Promise<void>
    {
        const configService: ConfigService = app.get (
            ConfigService
        );

        if (configService.get<string> ("app.env") === "production") app.use (
            helmet ()
        );
    }

    /**
     * @param {INestApplication} app
     * @returns {void | Promise<void>}
     */
    public static async bootCompression (app: INestApplication): Promise<void>
    {
        const configService: ConfigService = app.get (
            ConfigService
        );

        if (configService.get<string> ("app.env") === "production") app.use (
            compression ({
                filter: () => true,
                threshold: 0,
            })
        );
    }

    /**
     * @param {INestApplication} app
     * @returns {void | Promise<void>}
     */
    public static async bootRoute (app: INestApplication): Promise<void>
    {
        const configService: ConfigService = app.get (
            ConfigService
        );

        app.setGlobalPrefix (configService.get<string> ("app.prefixApiUrl"), { exclude: [ "(.*)verify-email(.*)", "(.*)reset-password(.*)", ], });
        app.enableVersioning ({ type: VersioningType.URI, });
    }

    /**
     * @param {INestApplication} app
     * @returns {void | Promise<void>}
     */
    public static async bootValidation (app: INestApplication): Promise<void>
    {
        const configService: ConfigService = app.get (
            ConfigService
        );

        useContainer (app.select (AppModule), { fallbackOnErrors: true, });
        app.useGlobalPipes (new ValidationPipe ({ transform: true, forbidNonWhitelisted: true, }));
    }
};
