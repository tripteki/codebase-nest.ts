import { Command, } from "nest-commander";
import { SeederCommand, } from "src/app/consoles/commands/app.seeder.command";
import { UserSeeder, } from "src/v1/api/user/databases/seeders/user.seeder";

@Command ({

    name: "v1:user:seed",
    description: "Command to seeding user data",
})
/**
 * @class {UserSeederCommand}
 * @extends {SeederCommand}
 */
export class UserSeederCommand extends SeederCommand
{
    /**
     * @param {UserSeeder} seeder
     * @returns {void}
     */
    constructor (
        protected seeder: UserSeeder
    )
    {
        super ();
    }
}
