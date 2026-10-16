import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { Seeder, } from "src/app/databases/seeders/app.seeder";
import { UserFactory, } from "src/v1/api/user/databases/factories/user.factory";
import { SettingSeeder, } from "src/v1/api/setting/databases/seeders/setting.seeder";
import { UserAclSeeder, } from "src/v1/api/user/databases/seeders/user.acl.seeder";
import { UserEnum, } from "src/v1/api/user/dtos/user.enum";

@Injectable ()
/**
 * @class {UserSeeder}
 * @implements {Seeder}
 */
export class UserSeeder implements Seeder
{
    /**
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @param {ConfigService} configService
     * @param {UserFactory} userFactory
     * @param {UserAclSeeder} userAclSeeder
     * @param {SettingSeeder} settingSeeder
     * @returns {void}
     */
    constructor (
        protected readonly prismaPostgreService: DatabasePrismaPostgreDriver,
        private readonly configService: ConfigService,
        private readonly userFactory: UserFactory,
        private readonly userAclSeeder: UserAclSeeder,
        private readonly settingSeeder: SettingSeeder
    )
    {
        //
    }

    /**
     * @returns {Promise<void>}
     */
    public async run (): Promise<void>
    {
        const name = UserEnum.Superuser;
        const email = `${name}@${this.configService.get<string> ("app.emailServer") ?? ""}`;
        const existing = await this.prismaPostgreService.user.findFirst ({
            where: {
                name,
                deleted_at: null,
            },
        });

        if (! existing) {
            await this.prismaPostgreService.user.create ({
                data: {
                    ...(await this.userFactory.definition ()),
                    name,
                    email,
                },
            });
        }

        await this.userAclSeeder.run ();
        await this.settingSeeder.run ();
    }
}
