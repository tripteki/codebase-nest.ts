import { Module, } from "@nestjs/common";
import { BullModule as QueueModule, } from "@nestjs/bull";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { AppConfigModule, } from "src/app/modules/app.config.module";
import { AppDatabaseModule, } from "src/app/modules/app.database.module";
import { UserAuthModule, } from "src/v1/api/user/modules/user.auth.module";
import { UserSeeder, } from "src/v1/api/user/databases/seeders/user.seeder";
import { UserFactory, } from "src/v1/api/user/databases/factories/user.factory";
import { UserAdminActivatedBroadcastListener, } from "src/v1/api/user/listeners/user.admin.activated.broadcast.listener";
import { UserAdminDeactivatedBroadcastListener, } from "src/v1/api/user/listeners/user.admin.deactivated.broadcast.listener";
import { UserAdminActivatedMailListener, } from "src/v1/api/user/listeners/user.admin.activated.mail.listener";
import { UserAdminDeactivatedMailListener, } from "src/v1/api/user/listeners/user.admin.deactivated.mail.listener";
import { UserAdminRepository, } from "src/v1/api/user/repositories/user.admin.repository";
import { UserAdminService, } from "src/v1/api/user/services/user.admin.service";
import { UserAdminController, } from "src/v1/api/user/controllers/user.admin.controller";
import { UserSeederCommand, } from "src/v1/api/user/consoles/commands/user.seeder.command";

@Module ({

    imports: [

        QueueModule.registerQueueAsync ({

            name: "user-admin-queue",
        }),

        AppHelperModule,
        AppConfigModule,
        AppDatabaseModule,
        UserAuthModule,
    ],

    exports: [

        //
    ],

    providers: [

        UserSeeder,
        UserFactory,
        UserAdminActivatedBroadcastListener,
        UserAdminDeactivatedBroadcastListener,
        UserAdminActivatedMailListener,
        UserAdminDeactivatedMailListener,
        UserAdminRepository,
        UserAdminService,
        UserSeederCommand,
    ],

    controllers: [

        UserAdminController,
    ],
})
/**
 * @class {UserAdminModule}
 */
export class UserAdminModule
{
    //
}
