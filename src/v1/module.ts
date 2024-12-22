import { Module, } from "@nestjs/common";
import { UserAdminModule as ApiUserAdminModule, } from "src/v1/api/user/modules/user.admin.module";
import { UserAuthModule as ApiUserAuthModule, } from "src/v1/api/user/modules/user.auth.module";
import { UserAuthModule as GraphqlUserAuthModule, } from "src/v1/graphql/user/modules/user.auth.module";
import { NotificationAdminModule, } from "src/v1/api/notification/modules/notification.admin.module";
import { NotificationUserModule, } from "src/v1/api/notification/modules/notification.user.module";

@Module ({

    imports: [

        ApiUserAdminModule,
        ApiUserAuthModule,
        GraphqlUserAuthModule,
        NotificationAdminModule,
        NotificationUserModule,
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
