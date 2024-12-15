"use strict";

import {

    toBoolean,
    configNamespace,
    findProjectRoot,
    ValidationErrorSerializer,
    AppConfig as AppConfigOption,

} from "@intentjs/core";

import { join, } from "path";

const project = require (join (findProjectRoot (), "package.json"));

/**
 * @interface
 * @extends {AppConfig}
 */
export interface ExtendedAppConfigOptions extends AppConfigOption
{
    /**
     * @type {string}
     */
    version: string;
};

export default configNamespace ("app", (): ExtendedAppConfigOptions => ({

    /**
     * -----------------------------------------------------
     * Application Name
     * -----------------------------------------------------
     *
     * This value is the name of your application. This value is
     * used when the framework needs to place the application's
     * name in a notification or any other location as required.
     */
    name: process.env.APP_NAME || "Basecode",

    /**
     * -----------------------------------------------------
     * Application Version
     * -----------------------------------------------------
     *
     * This value determines the version of your application.
     * It is typically taken from the `package.json` version field
     * or an environment variable. This version is used to track
     * the current version of your application during deployments.
     * You can set it through `process.env.APP_VERSION` or from
     * the `project.version` in `package.json`.
     */
    version: process.env.APP_VERSION || project.version || "1.0.0",

    /**
     * -----------------------------------------------------
     * Application Environment
     * -----------------------------------------------------
     *
     * This value determines the "environment" your application
     * is running in. You may set this value in ".env" file.
     */
    env: process.env.APP_ENV || process.env.NODE_ENV || "production",

    /**
     * -----------------------------------------------------
     * Application Debug Mode
     * -----------------------------------------------------
     *
     * When your application is in debug mode, Nest will try
     * to generate detailed error messages of any task failing.
     */
    debug: toBoolean (process.env.APP_DEBUG || true),



    /**
     * -----------------------------------------------------
     * Application URL
     * -----------------------------------------------------
     *
     * This URL is used by the console to generate complete
     * accessible URLs for your application.
     */
    url: process.env.APP_URL || "localhost",

    /**
     * -----------------------------------------------------
     * Application Port
     * -----------------------------------------------------
     *
     * This value is the port on which the server will listen
     * to all incoming requests. You may set this value in
     * ".env" file.
     */
    port: +process.env.APP_PORT || 8000,



    error: {

        /**
         * -----------------------------------------------------
         * Validation Serializer
         * -----------------------------------------------------
         *
         * This property defines the serializer class that will be
         * used to parse the validation errors. The value returned
         * from this class shall be thrown in the response object
         * whenever theier is a validation failure.
         */
        validationErrorSerializer: ValidationErrorSerializer,
    },

    /**
     * -----------------------------------------------------
     * Sentry Configuration
     * -----------------------------------------------------
     *
     * Nest comes with Sentry integration out of the box.
     * You can use Sentry to log errors that might come in your
     * application.
     *
     * You can get these values from your Sentry console.
     */
    sentry: {

        dsn: process.env.SENTRY_DSN,
        integrateNodeProfile: true,
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
    },

}));
