import { Module, } from "@nestjs/common";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { AppConfigModule, } from "src/app/modules/app.config.module";
import { AppDatabaseModule, } from "src/app/modules/app.database.module";
import { UserAuthModule, } from "src/v1/api/user/modules/user.auth.module";
import { UserWebpushRepository, } from "src/v1/api/user/repositories/user.webpush.repository";
import { UserWebpushService, } from "src/v1/api/user/services/user.webpush.service";
import { UserWebpushController, } from "src/v1/api/user/controllers/user.webpush.controller";

@Module ({

    imports: [

        AppHelperModule,
        AppConfigModule,
        AppDatabaseModule,
        UserAuthModule,
    ],

    exports: [

        UserWebpushRepository,
        UserWebpushService,
    ],

    providers: [

        UserWebpushRepository,
        UserWebpushService,
    ],

    controllers: [

        UserWebpushController,
    ],
})
/**
 * @class {UserWebpushModule}
 */
export class UserWebpushModule
{
    //
}
