import { Module, } from "@nestjs/common";
import { UserAdminModule as ApiUserAdminModule, } from "src/v1/api/user/modules/user.admin.module";
import { UserAuthModule as ApiUserAuthModule, } from "src/v1/api/user/modules/user.auth.module";
import { UserProfileModule as ApiUserProfileModule, } from "src/v1/api/user/modules/user.profile.module";
import { UserWebpushModule as ApiUserWebpushModule, } from "src/v1/api/user/modules/user.webpush.module";
// import { UserAuthModule as GraphqlUserAuthModule, } from "src/v1/graphql/user/modules/user.auth.module";
import { AclAdminModule, } from "src/v1/api/acl/modules/acl.admin.module";
import { DashboardAdminModule, } from "src/v1/api/dashboard/modules/dashboard.admin.module";
import { ActivityAdminModule, } from "src/v1/api/log/modules/activity.admin.module";
import { NotificationAdminModule, } from "src/v1/api/notification/modules/notification.admin.module";
import { NotificationUserModule, } from "src/v1/api/notification/modules/notification.user.module";
import { SearchAdminModule, } from "src/v1/api/search/modules/search.admin.module";
import { SettingAdminModule, } from "src/v1/api/setting/modules/setting.admin.module";

@Module ({

    imports: [

        ApiUserAdminModule,
        ApiUserAuthModule,
        ApiUserProfileModule,
        ApiUserWebpushModule,
        // GraphqlUserAuthModule,
        AclAdminModule,
        ActivityAdminModule,
        DashboardAdminModule,
        NotificationAdminModule,
        NotificationUserModule,
        SearchAdminModule,
        SettingAdminModule,
    ],

    exports: [

        //
    ],
})
/**
 * @class {V1Module}
 */
export class V1Module
{
    //
}
