"use strict";

import { CommandFactory, } from "nest-commander";
import { AppModule, } from "src/app/module";

/**
 * @returns {Promise<void>}
 */
(async () =>
{
    const

    app = await CommandFactory.run (
        AppModule
    );

}) ();
