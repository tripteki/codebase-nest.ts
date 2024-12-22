import { Injectable, } from "@nestjs/common";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { Seeder, } from "src/app/databases/seeders/app.seeder";
import { UserFactory, } from "src/v1/api/user/databases/factories/user.factory";

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
     * @returns {void}
     */
    constructor (
        protected readonly prismaPostgreService: DatabasePrismaPostgreDriver,
        private readonly userFactory: UserFactory
    )
    {
        //
    }

    /**
     * @returns {Promise<void>}
     */
    public async run (): Promise<void>
    {
        console.log (
            await this.prismaPostgreService.user.create ({
                data: await this.userFactory.definition (),
        }));
    }
}
