import { Module, } from "@nestjs/common";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { AppConfigModule, } from "src/app/modules/app.config.module";
import { AppDatabaseModule, } from "src/app/modules/app.database.module";
import { UserAuthRepository, } from "src/v1/api/user/repositories/user.auth.repository";
import { UserAuthService, } from "src/v1/api/user/services/user.auth.service";
import { UserAuthResolver, } from "src/v1/graphql/user/resolvers/user.auth.resolver";

@Module ({

    imports: [

        AppHelperModule,
        AppConfigModule,
        AppDatabaseModule,
    ],

    exports: [

        UserAuthService,
    ],

    providers: [

        UserAuthRepository,
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
