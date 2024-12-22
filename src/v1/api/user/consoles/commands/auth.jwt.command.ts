import { Command, CommandRunner, } from "nest-commander";
import * as crypto from "crypto";

@Command ({

    name: "v1:auth:jwt",
    description: "Command to generating secret auth jwt",
})
/**
 * @class {AuthJwtCommand}
 * @extends {CommandRunner}
 */
export class AuthJwtCommand extends CommandRunner
{
    /**
     * @returns {Promise<void>}
     */
    public async run (): Promise<void>
    {
        const secret: string = crypto.randomBytes (32).toString ("base64");

        console.log ('\x1b[33m%s\x1b[0m \x1b[32m%s\x1b[0m \x1b[33m%s\x1b[0m', "Generated jwt secret :", `${secret}`, '!');

        process.exit ();
    }
}
