"use strict";

import { registerAs, } from "@nestjs/config";
import { ConsoleDriverConfigService, FileDriverConfigService, } from "src/app/drivers/driver.log";
import * as winston from "winston";

export default registerAs ("log", () => (
{
    /**
     * The logging level to be used for filtering log messages.
     */
    level: String (process.env.LOG_LEVEL || "debug"),

    /**
     * The format applied to log messages.
     */
    format: winston.format.combine (

        winston.format.simple (),
        winston.format.timestamp (),
        winston.format.errors ({ stack: true, }),
    ),

    /**
     * Transport configurations that determine where logs are sent.
     */
    transports: [

        ... (new ConsoleDriverConfigService ()).createLogOptions (),
        ... (new FileDriverConfigService ()).createLogOptions (),
    ],
}));
