import { Module, forwardRef, } from "@nestjs/common";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { AppConfigModule, } from "src/app/modules/app.config.module";
import { AppDatabaseModule, } from "src/app/modules/app.database.module";
import { UserAuthModule, } from "src/v1/api/user/modules/user.auth.module";
import { UserProfileRepository, } from "src/v1/api/user/repositories/user.profile.repository";
import { UserAclRepository, } from "src/v1/api/user/repositories/user.acl.repository";
import { UserAclSeeder, } from "src/v1/api/user/databases/seeders/user.acl.seeder";
import { UserProfileService, } from "src/v1/api/user/services/user.profile.service";
import { UserProfileController, } from "src/v1/api/user/controllers/user.profile.controller";

@Module ({

    imports: [

        AppHelperModule,
        AppConfigModule,
        AppDatabaseModule,
        forwardRef (() => UserAuthModule),
    ],

    exports: [

        UserProfileRepository,
        UserProfileService,
        UserAclSeeder,
    ],

    providers: [

        UserProfileRepository,
        UserAclRepository,
        UserAclSeeder,
        UserProfileService,
    ],

    controllers: [

        UserProfileController,
    ],
})
/**
 * @class {UserProfileModule}
 */
export class UserProfileModule
{
    //
}
