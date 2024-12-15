"use strict";

import {

    CommandMeta,
    CommandObject,
    CommandRunner,
    ContainerFactory,

} from "@intentjs/core";

import yargs from "yargs-parser";
import "console.mute";

/**
 * @returns {Promise<void>}
 */
(async () =>
{
    // eslint-disable-next-line @typescript-eslint/no-var-requires

    const {

        ApplicationContainer,

    } = require ("app/providers/app.container");

    console["mute"] ();
    await ContainerFactory.createStandalone (ApplicationContainer);
    console["resume"] ();
    const argv: yargs.Arguments = yargs (process.argv.slice (2));
    argv.command = argv._[0];
    if (typeof argv.command != "string") return process.exit ();
    const command: CommandObject = CommandMeta.getCommand (argv.command);
    if (! command || ! command.target) return process.exit ();
    await CommandRunner.handle (command, argv);

}) ();
