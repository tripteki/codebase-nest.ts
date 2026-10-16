import { Injectable, } from "@nestjs/common";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { Seeder, } from "src/app/databases/seeders/app.seeder";
import { ulid, } from "ulid";

/**
 * @type {Array<[string, string]>}
 */
const DEFAULT_SETTINGS: Array<[string, string]> = [
    [ "APP_NAME", "Codebase", ],
    [ "COLOR_PRIMARY", "#2563eb", ],
    [ "COLOR_SECONDARY", "#84cc16", ],
    [ "COLOR_TERTIARY", "#1e3a8a", ],
    [ "DEFAULT_LOCALE", "id", ],
];

@Injectable ()
/**
 * @class {SettingSeeder}
 * @implements {Seeder}
 */
export class SettingSeeder implements Seeder
{
    /**
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @param {DateTimeHelper} dateTimeHelper
     * @returns {void}
     */
    constructor (
        protected readonly prismaPostgreService: DatabasePrismaPostgreDriver,
        protected readonly dateTimeHelper: DateTimeHelper
    )
    {
        //
    }

    /**
     * @returns {Promise<void>}
     */
    public async run (): Promise<void>
    {
        const now = this.dateTimeHelper.now ();

        for (const [ key, value, ] of DEFAULT_SETTINGS) {
            const existing = await this.prismaPostgreService.setting.findFirst ({
                where: { key, deleted_at: null, },
            });

            if (existing) continue;

            await this.prismaPostgreService.setting.create ({
                data: {
                    id: ulid (),
                    key,
                    value,
                    value_kind: "text",
                    created_at: now,
                    updated_at: now,
                },
            });
        }
    }
}
