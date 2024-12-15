import { Command, } from "@intentjs/core";
import { SeederCommand, } from "src/v1/api/common/consoles/commands/seeder.command";
import { UserSeeder, } from "src/v1/api/user/databases/seeders/user.seeder";

/**
 * @class UserSeederCommand
 * @extends {SeederCommand}
 */
@Command ("v1:user:seed {--multiple: Number of seed user data}", { desc: "Command to seeding user data", })
export class UserSeederCommand extends SeederCommand
{
    /**
     * @returns { UserSeeder }
     */
    protected seeder (): UserSeeder
    {
        return new UserSeeder ();
    }
}
