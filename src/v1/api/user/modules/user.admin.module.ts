import { Module, } from "@nestjs/common";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { UserSeeder, } from "src/v1/api/user/databases/seeders/user.seeder";
import { UserFactory, } from "src/v1/api/user/databases/factories/user.factory";
import { UserSeederCommand, } from "src/v1/api/user/consoles/commands/user.seeder.command";

@Module ({

    imports: [

        AppHelperModule,
    ],

    exports: [

        //
    ],

    providers: [

        UserSeeder,
        UserFactory,
        UserSeederCommand,
    ],

    controllers: [

        //
    ],
})
/**
 * @class {UserAdminModule}
 */
export class UserAdminModule
{
    //
}
