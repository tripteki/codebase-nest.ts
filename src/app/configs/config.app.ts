"use strict";

import { registerAs, } from "@nestjs/config";
import * as project from "../../../package.json";

export default registerAs ("app", () => (
{
    /**
     * Application name.
     */
    name: String (project.name || process.env.APP_NAME || "Basecode"),

    /**
     * Version of application.
     */
    version: String (project.version || process.env.APP_VERSION || "1.0.0"),

    //

    /**
     * Host of application to serve.
     */
    host: String (process.env.APP_HOST || "0.0.0.0"),

    /**
     * Port of application to serve.
     */
    port: Number (process.env.APP_PORT || 3000),

    /**
     * Cross-Origin Resource Share.
     */
    cors: {

        /**
         * Configures the `Access-Control-Allow-Origins` CORS header. [See for more detail.](https://github.com/expressjs/cors#configuration-options).
         */
        origin: String (process.env.FRONTEND_URL || "http://localhost:3000"),

        /**
         * Configures the Access-Control-Allow-Methods CORS header.
         */
        methods: [

            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "GET",
            "HEAD",
        ],

        /**
         * Configures the Access-Control-Allow-Headers CORS header.
         */
        allowedHeaders: [

            "*",
        ],

        /**
         * Configures the Access-Control-Expose-Headers CORS header.
         */
        exposedHeaders: [

            //
        ],

        /**
         * Configures the Access-Control-Max-Age CORS header.
         */
        maxAge: 0,

        /**
         * Configures the Access-Control-Allow-Credentials CORS header.
         */
        credentials: false,
    },

    //

    /**
     * Environment of application.
     */
    env: String (process.env.NODE_ENV || "production"),

    /**
     * Timezone of application.
     */
    timezone: String (process.env.TZ || "UTC"),
    datetimeFormat: "YYYY-MM-DD HH:mm:ss",

    /**
     * Localization of application.
     */
    locale: String (process.env.APP_LOCALE || "en"),
    fallbackLocale: String (process.env.APP_FALLBACK_LOCALE || "en"),
    fakerLocale: String (process.env.APP_FAKER_LOCALE || "en_US"),
}));
