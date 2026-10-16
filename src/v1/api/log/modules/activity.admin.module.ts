import { Module, } from "@nestjs/common";
import { AppConfigModule, } from "src/app/modules/app.config.module";
import { AppDatabaseModule, } from "src/app/modules/app.database.module";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { ActivityAdminController, } from "src/v1/api/log/controllers/activity.admin.controller";
import { AdminRefreshBroadcastListener, } from "src/v1/api/log/listeners/admin.refresh.broadcast.listener";
import { ActivityAdminRepository, } from "src/v1/api/log/repositories/activity.admin.repository";
import { ActivityAdminService, } from "src/v1/api/log/services/activity.admin.service";
import { ActivityRecorder, } from "src/v1/api/log/support/activity.recorder";
import { UserAuthModule, } from "src/v1/api/user/modules/user.auth.module";
import { UserProfileModule, } from "src/v1/api/user/modules/user.profile.module";

@Module ({

    imports: [

        AppHelperModule,
        AppConfigModule,
        AppDatabaseModule,
        UserAuthModule,
        UserProfileModule,
    ],

    exports: [

        ActivityAdminService,
        ActivityRecorder,
    ],

    providers: [

        ActivityRecorder,
        AdminRefreshBroadcastListener,
        ActivityAdminRepository,
        ActivityAdminService,
    ],

    controllers: [

        ActivityAdminController,
    ],
})
/**
 * @class {ActivityAdminModule}
 */
export class ActivityAdminModule
{
    //
}
