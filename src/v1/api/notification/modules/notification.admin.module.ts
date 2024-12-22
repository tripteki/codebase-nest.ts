import { Module, } from "@nestjs/common";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { AppConfigModule, } from "src/app/modules/app.config.module";
import { AppDatabaseModule, } from "src/app/modules/app.database.module";
import { UserAuthModule, } from "src/v1/api/user/modules/user.auth.module";
import { NotificationAdminRepository, } from "src/v1/api/notification/repositories/notification.admin.repository";
import { NotificationAdminService, } from "src/v1/api/notification/services/notification.admin.service";
import { NotificationAdminController, } from "src/v1/api/notification/controllers/notification.admin.controller";

@Module ({

    imports: [

        AppHelperModule,
        AppConfigModule,
        AppDatabaseModule,
        UserAuthModule,
    ],

    exports: [

        NotificationAdminService,
    ],

    providers: [

        NotificationAdminRepository,
        NotificationAdminService,
    ],

    controllers: [

        NotificationAdminController,
    ],
})
/**
 * @class {NotificationAdminModule}
 */
export class NotificationAdminModule
{
    //
}
