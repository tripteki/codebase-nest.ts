"use strict";

import { repl, } from "@nestjs/core";
import { AppReplProvider, } from "src/app/providers/app.repl.provider";
import { AppModule, } from "src/app/modules/app.module";

/**
 * @returns {Promise<void>}
 */
(async (): Promise<void> =>
{
    const

    app = await repl (
        AppModule
    );

    app.setupHistory (".nestjs_repl_history", (thrower: any) => {

        if (thrower) {

            console.error (thrower);
        }
    });

}) ();
