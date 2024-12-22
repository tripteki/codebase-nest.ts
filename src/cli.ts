"use strict";

import { Logger as LoggerService, } from "@nestjs/common";
import { CommandFactory, } from "nest-commander";
import { AppConsoleProvider, } from "src/app/providers/app.console.provider";
import { AppModule, } from "src/app/modules/app.module";

/**
 * @returns {Promise<void>}
 */
(async (): Promise<void> =>
{
    const

    app = await CommandFactory.run (
        AppModule,
        LoggerService
    );

}) ();
