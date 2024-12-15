import { Seeder, } from "src/v1/api/common/databases/seeders/seeder";
import { UserFactory, } from "src/v1/api/user/databases/factories/user.factory";
import { UserEntity, } from "src/v1/api/user/entities/user.entity";

/**
 * @class UserSeeder
 * @implements {Seeder}
 */
export class UserSeeder implements Seeder
{
    /**
     * @returns { Promise<void> }
     */
    public async run (): Promise<void>
    {
        await UserEntity.query ().insert (
            await new UserFactory ().definition ()
        );
    }
}
