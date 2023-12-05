"use strict";

import { registerAs, } from "@nestjs/config";
import * as project from "../package.json";

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



    /**
     * Host of application to serve.
     */
    host: String (process.env.APP_HOST || "0.0.0.0"),

    /**
     * Port of application to serve.
     */
    port: Number (process.env.APP_PORT || 3000),



    /**
     * Environment of application.
     */
    env: String (process.env.NODE_ENV || "production"),

    /**
     * Timezone of application.
     */
    timezone: String (process.env.TZ || "UTC"),
}));
