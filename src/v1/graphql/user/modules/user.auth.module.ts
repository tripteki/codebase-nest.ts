import { Module, } from "@nestjs/common";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { AppConfigModule, } from "src/app/modules/app.config.module";
import { AppDatabaseModule, } from "src/app/modules/app.database.module";
import { UserAuthModule as ApiUserAuthModule, } from "src/v1/api/user/modules/user.auth.module";
import { UserAuthService, } from "src/v1/graphql/user/services/user.auth.service";
import { UserAuthResolver, } from "src/v1/graphql/user/resolvers/user.auth.resolver";

@Module ({

    imports: [

        AppHelperModule,
        AppConfigModule,
        AppDatabaseModule,
        ApiUserAuthModule,
    ],

    exports: [

        UserAuthService,
    ],

    providers: [

        UserAuthService,
        UserAuthResolver,
    ],
})
/**
 * @class {UserAuthModule}
 */
export class UserAuthModule
{
    //
}
