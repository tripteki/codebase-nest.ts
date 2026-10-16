import { Module, } from "@nestjs/common";
import { BullModule as QueueModule, } from "@nestjs/bull";
import { AppConfigModule, } from "src/app/modules/app.config.module";
import { AppDatabaseModule, } from "src/app/modules/app.database.module";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { PermissionAdminController, } from "src/v1/api/acl/controllers/permission.admin.controller";
import { RoleAdminController, } from "src/v1/api/acl/controllers/role.admin.controller";
import { AclAdminExportedDatabaseListener, } from "src/v1/api/acl/listeners/acl.admin.exported.database.listener";
import { AclAdminImportedDatabaseListener, } from "src/v1/api/acl/listeners/acl.admin.imported.database.listener";
import { AclAdminTransferBroadcastListener, } from "src/v1/api/acl/listeners/acl.admin.transfer.broadcast.listener";
import { PermissionAdminExportProcessor, } from "src/v1/api/acl/processors/permission.admin.export.processor";
import { PermissionAdminImportProcessor, } from "src/v1/api/acl/processors/permission.admin.import.processor";
import { RoleAdminExportProcessor, } from "src/v1/api/acl/processors/role.admin.export.processor";
import { RoleAdminImportProcessor, } from "src/v1/api/acl/processors/role.admin.import.processor";
import { PermissionAdminRepository, } from "src/v1/api/acl/repositories/permission.admin.repository";
import { RoleAdminRepository, } from "src/v1/api/acl/repositories/role.admin.repository";
import { PermissionAdminService, } from "src/v1/api/acl/services/permission.admin.service";
import { RoleAdminService, } from "src/v1/api/acl/services/role.admin.service";
import { ActivityRecorder, } from "src/v1/api/log/support/activity.recorder";
import { NotificationUserModule, } from "src/v1/api/notification/modules/notification.user.module";
import { UserAuthModule, } from "src/v1/api/user/modules/user.auth.module";
import { UserProfileModule, } from "src/v1/api/user/modules/user.profile.module";

@Module ({

    imports: [

        QueueModule.registerQueueAsync ({

            name: "acl-admin-queue",
        }),

        AppHelperModule,
        AppConfigModule,
        AppDatabaseModule,
        NotificationUserModule,
        UserAuthModule,
        UserProfileModule,
    ],

    exports: [

        RoleAdminService,
        PermissionAdminService,
        RoleAdminRepository,
        PermissionAdminRepository,
    ],

    providers: [

        ActivityRecorder,
        RoleAdminRepository,
        PermissionAdminRepository,
        RoleAdminImportProcessor,
        RoleAdminExportProcessor,
        PermissionAdminImportProcessor,
        PermissionAdminExportProcessor,
        AclAdminImportedDatabaseListener,
        AclAdminExportedDatabaseListener,
        AclAdminTransferBroadcastListener,
        RoleAdminService,
        PermissionAdminService,
    ],

    controllers: [

        RoleAdminController,
        PermissionAdminController,
    ],
})
/**
 * @class {AclAdminModule}
 */
export class AclAdminModule
{
    //
}
