import { Module, } from "@nestjs/common";
import { AppConfigModule, } from "src/app/modules/app.config.module";
import { AppDatabaseModule, } from "src/app/modules/app.database.module";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { AclAdminModule, } from "src/v1/api/acl/modules/acl.admin.module";
import { ActivityAdminModule, } from "src/v1/api/log/modules/activity.admin.module";
import { SearchAdminController, } from "src/v1/api/search/controllers/search.admin.controller";
import { SearchAdminService, } from "src/v1/api/search/services/search.admin.service";
import { UserAdminModule, } from "src/v1/api/user/modules/user.admin.module";
import { UserAuthModule, } from "src/v1/api/user/modules/user.auth.module";
import { UserProfileModule, } from "src/v1/api/user/modules/user.profile.module";

@Module ({

    imports: [

        AppHelperModule,
        AppConfigModule,
        AppDatabaseModule,
        UserAuthModule,
        UserProfileModule,
        UserAdminModule,
        AclAdminModule,
        ActivityAdminModule,
    ],

    providers: [

        SearchAdminService,
    ],

    controllers: [

        SearchAdminController,
    ],
})
/**
 * @class {SearchAdminModule}
 */
export class SearchAdminModule
{
    //
}
