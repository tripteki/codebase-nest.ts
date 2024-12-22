import { Injectable, } from "@nestjs/common";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { Seeder, } from "src/app/databases/seeders/app.seeder";
import { UserFactory, } from "src/v1/api/user/databases/factories/user.factory";
import { UserAclSeeder, } from "src/v1/api/user/databases/seeders/user.acl.seeder";

@Injectable ()
/**
 * @class {UserSeeder}
 * @implements {Seeder}
 */
export class UserSeeder implements Seeder
{
    /**
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @param {UserFactory} userFactory
     * @param {UserAclSeeder} userAclSeeder
     * @returns {void}
     */
    constructor (
        protected readonly prismaPostgreService: DatabasePrismaPostgreDriver,
        private readonly userFactory: UserFactory,
        private readonly userAclSeeder: UserAclSeeder
    )
    {
        //
    }

    /**
     * @returns {Promise<void>}
     */
    public async run (): Promise<void>
    {
        const existing = await this.prismaPostgreService.user.findFirst ({
            where: {
                name: "superuser",
                deleted_at: null,
            },
        });

        if (! existing) {
            await this.prismaPostgreService.user.create ({
                data: {
                    ...(await this.userFactory.definition ()),
                    name: "superuser",
                    email: "superuser@mail.com",
                },
            });
        }

        await this.userAclSeeder.run ();
    }
}
