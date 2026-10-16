import { Module, } from "@nestjs/common";
import { AppConfigModule, } from "src/app/modules/app.config.module";
import { AppDatabaseModule, } from "src/app/modules/app.database.module";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { ActivityRecorder, } from "src/v1/api/log/support/activity.recorder";
import { SettingAdminController, } from "src/v1/api/setting/controllers/setting.admin.controller";
import { SettingVariablesController, } from "src/v1/api/setting/controllers/setting.variables.controller";
import { SettingSeeder, } from "src/v1/api/setting/databases/seeders/setting.seeder";
import { SettingAdminService, } from "src/v1/api/setting/services/setting.admin.service";
import { UserAuthModule, } from "src/v1/api/user/modules/user.auth.module";
import { UserProfileModule, } from "src/v1/api/user/modules/user.profile.module";

@Module ({

    imports: [

        AppHelperModule,
        AppConfigModule,
        AppDatabaseModule,
        UserAuthModule,
        UserProfileModule,
    ],

    exports: [

        SettingAdminService,
        SettingSeeder,
    ],

    providers: [

        ActivityRecorder,
        SettingSeeder,
        SettingAdminService,
    ],

    controllers: [

        SettingAdminController,
        SettingVariablesController,
    ],
})
/**
 * @class {SettingAdminModule}
 */
export class SettingAdminModule
{
    //
}
