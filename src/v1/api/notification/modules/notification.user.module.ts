import { Module, } from "@nestjs/common";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { AppConfigModule, } from "src/app/modules/app.config.module";
import { AppDatabaseModule, } from "src/app/modules/app.database.module";
import { UserAuthModule, } from "src/v1/api/user/modules/user.auth.module";
import { NotificationUserRepository, } from "src/v1/api/notification/repositories/notification.user.repository";
import { NotificationUserService, } from "src/v1/api/notification/services/notification.user.service";
import { NotificationUserController, } from "src/v1/api/notification/controllers/notification.user.controller";

@Module ({

    imports: [

        AppHelperModule,
        AppConfigModule,
        AppDatabaseModule,
        UserAuthModule,
    ],

    exports: [

        NotificationUserService,
    ],

    providers: [

        NotificationUserRepository,
        NotificationUserService,
    ],

    controllers: [

        NotificationUserController,
    ],
})
/**
 * @class {NotificationUserModule}
 */
export class NotificationUserModule
{
    //
}
