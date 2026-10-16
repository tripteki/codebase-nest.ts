import { Module, } from "@nestjs/common";
import { AppConfigModule, } from "src/app/modules/app.config.module";
import { AppDatabaseModule, } from "src/app/modules/app.database.module";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { DashboardAdminController, } from "src/v1/api/dashboard/controllers/dashboard.admin.controller";
import { DashboardAdminService, } from "src/v1/api/dashboard/services/dashboard.admin.service";
import { ActivityAdminRepository, } from "src/v1/api/log/repositories/activity.admin.repository";
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

    providers: [

        ActivityAdminRepository,
        DashboardAdminService,
    ],

    controllers: [

        DashboardAdminController,
    ],
})
/**
 * @class {DashboardAdminModule}
 */
export class DashboardAdminModule
{
    //
}
