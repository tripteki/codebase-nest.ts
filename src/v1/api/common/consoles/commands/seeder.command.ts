import { ConsoleIO, } from "@intentjs/core";
import { Seeder, } from "src/v1/api/common/databases/seeders/seeder";

/**
 * @class SeederCommand
 */
export abstract class SeederCommand
{
    /**
     * @returns { Seeder }
     */
    protected abstract seeder (): Seeder;

    /**
     * @param { ConsoleIO } cli
     * @returns { Promise<void> }
     */
    public async handle (cli: ConsoleIO): Promise<void>
    {
        const multiple: number = Number (cli.option<number> ("multiple")) || 1;

        for (let i = 0; i < multiple; i++) {

            cli.success (`Seeding #${i + 1} of ${this.seeder ().constructor.name}!`);

            await this.seeder ().run ();
        }

        process.exit ();
    }
}
