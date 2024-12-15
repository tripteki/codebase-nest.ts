"use strict";

import {

    toBoolean,
    configNamespace,
    Formats,
    Transports,
    LogLevel,
    IntentLoggerOptions,

} from "@intentjs/core";

export default configNamespace ("logger", (): IntentLoggerOptions => ({

    /**
     * -----------------------------------------------------
     * Default Logger
     * -----------------------------------------------------
     * Documentation - https://tryintent.com/docs/logging
     *
     * This value is the name of the default logger. This will be
     * used when you use the `Log ()` facade.
     */
    default: process.env.DEFAULT_LOG || "app",

    /**
     * -----------------------------------------------------
     * Disable Global Console Log
     * -----------------------------------------------------
     * Documentation - https://tryintent.com/docs/logging
     *
     * This flag is used to define if the console log being done
     * through these loggers should be disabled globally. You
     * can change this setting in ".env" file
     *
     * This setting doesn't affect the behaviour of the
     * "console.log" statement.
     */
    disableConsole: toBoolean (process.env.DISABLE_CONSOLE_LOG || false),

    /**
     * -----------------------------------------------------
     * Loggers
     * -----------------------------------------------------
     * Documentation - https://tryintent.com/docs/logging
     *
     * You can configure loggers for different purpose in your
     * application. For example, you can make "orders" or "payments"
     * loggers.
     */
    loggers: {

        app: {

            level: (process.env.LOG_LEVEL as LogLevel) || "debug",

            transports: [

                {
                    transport: Transports.Console,
                    format: Formats.Default,
                },
                {
                    transport: Transports.File,
                    format: Formats.Json,
                    options: { filename: "nest.log", },
                },
            ],
        },
    },

}));
