import { Module, } from "@nestjs/common";
import { UserAdminModule, } from "src/v1/api/user/modules/user.admin.module";
import { UserAuthModule, } from "src/v1/api/user/modules/user.auth.module";

@Module ({

    imports: [

        UserAdminModule,
        UserAuthModule,
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
