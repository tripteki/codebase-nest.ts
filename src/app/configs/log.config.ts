"use strict";

import { registerAs, } from "@nestjs/config";
import {

    LogConsoleDriver,
    LogFileDriver,
    LogElasticDriver,

} from "src/app/drivers/log.driver";

export default registerAs ("log", () => ({

    /**
     * -----------------------------------------------------
     * Log Level
     * -----------------------------------------------------
     *
     * The available levels are: `debug`, `info`, `warn`, `error`, etc.
     * This setting controls the verbosity of the logs. It can be set via
     * `process.env.LOG_LEVEL`. If not provided, it defaults to "debug".
     */
    level: String (process.env.LOG_LEVEL || "debug"),

    /**
     * -----------------------------------------------------
     * Log Drivers
     * -----------------------------------------------------
     *
     * Transport configurations that determine while logging.
     */
    transports: [

        ... LogConsoleDriver.createLogOptions (),
        ... LogFileDriver.createLogOptions (),
    ],

}));
