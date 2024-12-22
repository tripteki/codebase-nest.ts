"use strict";

import { Module, } from "@nestjs/common";
import { AppSecretCommand, } from "src/app/consoles/commands/app.secret.command";

@Module ({

    imports: [

        //
    ],

    exports: [

        //
    ],

    providers: [

        AppSecretCommand,
    ],
})
/**
 * @class {AppConsoleModule}
 */
export class AppConsoleModule
{
    //
};
