import { Module, } from "@nestjs/common";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { AppConfigModule, } from "src/app/modules/app.config.module";
import { AppDatabaseModule, } from "src/app/modules/app.database.module";
import { UserAuthRegisteredMailListener, } from "src/v1/api/user/listeners/user.auth.registered.mail.listener";
import { UserAuthResetMailListener, } from "src/v1/api/user/listeners/user.auth.reset.mail.listener";
import { UserAuthRepository, } from "src/v1/api/user/repositories/user.auth.repository";
import { UserAuthService, } from "src/v1/api/user/services/user.auth.service";
import { UserAuthController, } from "src/v1/api/user/controllers/user.auth.controller";

@Module ({

    imports: [

        AppHelperModule,
        AppConfigModule,
        AppDatabaseModule,
    ],

    exports: [

        UserAuthRegisteredMailListener,
        UserAuthResetMailListener,
        UserAuthRepository,
        UserAuthService,
    ],

    providers: [

        UserAuthRegisteredMailListener,
        UserAuthResetMailListener,
        UserAuthRepository,
        UserAuthService,
    ],

    controllers: [

        UserAuthController,
    ],
})
/**
 * @class {UserAuthModule}
 */
export class UserAuthModule
{
    //
}
