import { Module, } from "@nestjs/common";
import { UserAdminModule, } from "src/v1/api/user/modules/user.admin.module";
import { UserModule, } from "src/v1/graphql/user/modules/user.module";

@Module ({

    imports: [

        UserAdminModule,
        UserModule,
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
