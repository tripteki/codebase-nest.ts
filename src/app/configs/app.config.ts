"use strict";

import { registerAs, } from "@nestjs/config";
import * as project from "../../../package.json";

export default registerAs ("app", () => ({

    /**
     * -----------------------------------------------------
     * Application Name
     * -----------------------------------------------------
     *
     * The name of the application. Used in notifications or
     * anywhere the application name is needed.
     * This value can be configured using `process.env.APP_NAME`, 
     * or fallback to the name in `package.json`, or default to "Basecode".
     */
    name: String (process.env.APP_NAME || project.name || "Basecode"),

    /**
     * -----------------------------------------------------
     * Application Secret
     * -----------------------------------------------------
     *
     * The secret is crucial for securing cryptographic operations.
     * Make sure to set this in your .env file by running `cli secret`.
     */
    secret: String (process.env.APP_SECRET),

    /**
     * -----------------------------------------------------
     * Application Version
     * -----------------------------------------------------
     *
     * Specifies the version of the application, which helps in
     * tracking deployments and versions. Can be set through
     * `process.env.APP_VERSION`, or fetched from `package.json` version.
     * If neither are provided, it defaults to "1.0.0".
     */
    version: String (process.env.APP_VERSION || project.version || "1.0.0"),

    /**
     * -----------------------------------------------------
     * Host of Application
     * -----------------------------------------------------
     *
     * Defines the host the application will listen to. Defaults to
     * "0.0.0.0" if not provided via `process.env.APP_HOST`.
     */
    host: String (process.env.APP_HOST || "0.0.0.0"),

    /**
     * -----------------------------------------------------
     * Port of Application
     * -----------------------------------------------------
     *
     * Defines the port number the application will run on.
     * Default is 3000, or can be configured via `process.env.APP_PORT`.
     */
    port: Number (process.env.APP_PORT || 3000),

    /**
     * -----------------------------------------------------
     * API URL Prefix of Application
     * -----------------------------------------------------
     *
     * Defines the prefix for the application's API routes.
     */
    prefixApiUrl: "api",

    /**
     * -----------------------------------------------------
     * GRAPHQL URL Prefix of Application
     * -----------------------------------------------------
     *
     * Defines the prefix for the application's GRAPHQL routes.
     */
    prefixGraphqlUrl: "graphql",

    /**
     * -----------------------------------------------------
     * Frontend URL of Application
     * -----------------------------------------------------
     *
     * Defines the FRONTEND application url.
     */
    frontendUrl: String (process.env.FRONTEND_URL || "http://localhost:3000"),

    /**
     * -----------------------------------------------------
     * Cross-Origin Resource Sharing (CORS)
     * -----------------------------------------------------
     *
     * Configuration for handling CORS headers to allow the application
     * to interact with other domains. It includes options such as:
     * - `origin`: Controls the allowed origins (defaults to frontend URL).
     * - `methods`: The allowed HTTP methods (GET, POST, etc.).
     * - `allowedHeaders`: The allowed headers in the request (e.g., `*` for all).
     * - `exposedHeaders`: Headers that are allowed to be exposed to the client.
     * - `maxAge`: The duration for which the CORS preflight request is cached.
     * - `credentials`: Whether to allow credentials (cookies, etc.).
     */
    cors: {

        origin: String (process.env.FRONTEND_URL || "http://localhost:3000"),

        methods: [

            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "GET",
            "HEAD",
        ],

        allowedHeaders: [

            "*",
        ],

        exposedHeaders: [

            //
        ],

        maxAge: 0,

        credentials: false,
    },

    /**
     * -----------------------------------------------------
     * Environment of the Application
     * -----------------------------------------------------
     *
     * Specifies the current environment (e.g., development, production).
     * The environment can be set using `process.env.APP_ENV` or `process.env.NODE_ENV`.
     * Defaults to "production" if neither is provided.
     */
    env: String (process.env.APP_ENV || process.env.NODE_ENV || "production"),

    /**
     * -----------------------------------------------------
     * Timezone of the Application
     * -----------------------------------------------------
     *
     * Configures the application's timezone. Defaults to UTC, but
     * can be set via `process.env.TZ` (e.g., "America/New_York").
     */
    timezone: String (process.env.TZ || "UTC"),

    /**
     * -----------------------------------------------------
     * Date/Time Format
     * -----------------------------------------------------
     *
     * Specifies the format in which dates/times are displayed in the application.
     * This can be adjusted as needed.
     */
    datetimeFormat: "YYYY-MM-DD HH:mm:ss",

    /**
     * -----------------------------------------------------
     * Localization of the Application
     * -----------------------------------------------------
     *
     * Controls the application's locale settings, determining the language and 
     * formatting conventions. It can be configured with:
     * - `locale`: Main locale (default is "en").
     * - `fakerLocale`: Locale for generating fake data (default is "en").
     * - `fallbackLocale`: Fallback locale in case the preferred locale is unavailable.
     */
    locale: String (process.env.APP_LOCALE || "en"),
    fakerLocale: String (process.env.APP_FAKER_LOCALE || "en"),
    fallbackLocale: String (process.env.APP_FALLBACK_LOCALE || "en"),

}));
