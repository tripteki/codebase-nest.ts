"use strict";

import { repl, } from "@nestjs/core";
import { AppModule, } from "src/app/modules/module";

/**
 * @returns {Promise<void>}
 */
(async () =>
{
    const

    app = await repl (
        AppModule
    );

    app.setupHistory (".nestjs_repl_history", thrower => {

        if (thrower) {

            console.error (thrower);
        }
    });

}) ();
