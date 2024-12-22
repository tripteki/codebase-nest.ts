import { Module, } from "@nestjs/common";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { AppConfigModule, } from "src/app/modules/app.config.module";
import { AppDatabaseModule, } from "src/app/modules/app.database.module";
import { UserAuthRepository, } from "src/v1/api/user/repositories/user.auth.repository";

@Module ({

    imports: [

        AppHelperModule,
        AppConfigModule,
        AppDatabaseModule,
    ],

    exports: [

        //
    ],

    providers: [

        UserAuthRepository,
    ],

    controllers: [

        //
    ],
})
/**
 * @class {UserAuthModule}
 */
export class UserAuthModule
{
    //
}
