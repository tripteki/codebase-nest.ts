"use strict";

import { Command, CommandRunner, } from "nest-commander";
import * as crypto from "crypto";

@Command ({

    name: "secret",
    description: "Command to generating app secret",
})
/**
 * @class {AppSecretCommand}
 * @extends {CommandRunner}
 */
export class AppSecretCommand extends CommandRunner
{
    /**
     * @returns {Promise<void>}
     */
    public async run (): Promise<void>
    {
        const secret: string = crypto.randomBytes (32).toString ("base64");

        console.log ('\x1b[33m%s\x1b[0m \x1b[32m%s\x1b[0m \x1b[33m%s\x1b[0m', "Generated app secret :", `${secret}`, '!');

        process.exit ();
    }
};
