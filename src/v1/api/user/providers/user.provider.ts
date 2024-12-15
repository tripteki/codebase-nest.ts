import { IntentApplicationContext, ServiceProvider, } from "@intentjs/core";
import { UserAdminRepository, } from "src/v1/api/user/repositories/user.admin.repository";
import { UserAdminService, } from "src/v1/api/user/services/user.admin.service";
import { UserSeederCommand, } from "src/v1/api/user/consoles/commands/user.seeder.command";

/**
 * @class UserServiceProvider
 * @extends {ServiceProvider}
 */
export class UserServiceProvider extends ServiceProvider
{
    /**
     * @returns { void }
     */
    public register (): void
    {
        this.bindWithClass ("V1_USER_ADMIN_REPOSITORY", UserAdminRepository);
        this.bind (UserAdminService);

        this.registerConsoles ();
    }

    /**
     * @param { IntentApplicationContext } app
     * @returns { void }
     */
    public boot (app: IntentApplicationContext): void
    {
        //
    }

    /**
     * @returns { void }
     */
    public registerConsoles (): void
    {
        this.bind (UserSeederCommand);
    }
}
