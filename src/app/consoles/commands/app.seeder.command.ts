"use strict";

import { CommandRunner, Option, } from "nest-commander";
import { Seeder, } from "src/app/databases/seeders/app.seeder";

/**
 * @typedef {Object} SeederCommandType
 * @property {number | null} multiple
 */
type SeederCommandType =
{
    multiple?: number;
};

/**
 * @class {SeederCommand}
 * @extends {CommandRunner}
 */
export class SeederCommand extends CommandRunner
{
    /**
     * @type {Seeder}
     */
    protected seeder: Seeder;

    @Option ({

        flags: "-m, --multiple [number]",
        description: "number of datas to seed (default to 1)",
        defaultValue: 1,
    })
    /**
     * @param {number} multiple
     * @returns {number}
     */
    protected parseMultiple (multiple: number): number
    {
        return Number (multiple);
    }

    /**
     * @param {string[]} parameters
     * @param {SeederCommandType | null} options
     * @returns {Promise<void>}
     */
    public async run (
        parameters: string[],
        options?: SeederCommandType
    ): Promise<void>
    {
        const multiple: number = options.multiple;

        for (let i = 0; i < multiple; i++) {

            console.log ('\x1b[33m%s\x1b[0m', `Seeding #${i + 1} of ${this.seeder.constructor.name}!`);

            await this.seeder.run ();
        }

        process.exit ();
    }
};
