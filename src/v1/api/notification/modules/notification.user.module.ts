import { Module, } from "@nestjs/common";
import { BullModule as QueueModule, } from "@nestjs/bull";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { AppConfigModule, } from "src/app/modules/app.config.module";
import { AppDatabaseModule, } from "src/app/modules/app.database.module";
import { UserAuthModule, } from "src/v1/api/user/modules/user.auth.module";
import { UserWebpushModule, } from "src/v1/api/user/modules/user.webpush.module";
import { NotificationUserRepository, } from "src/v1/api/notification/repositories/notification.user.repository";
import { NotificationUserService, } from "src/v1/api/notification/services/notification.user.service";
import { NotificationWebpushService, } from "src/v1/api/notification/services/notification.webpush.service";
import { NotificationUserController, } from "src/v1/api/notification/controllers/notification.user.controller";
import { NotificationCreatedBroadcastListener, } from "src/v1/api/notification/listeners/notification.created.broadcast.listener";
import { NotificationCreatedWebpushListener, } from "src/v1/api/notification/listeners/notification.created.webpush.listener";
import { NotificationWebpushProcessor, } from "src/v1/api/notification/processors/notification.webpush.processor";

@Module ({

    imports: [

        QueueModule.registerQueueAsync ({

            name: "notifications",
        }),

        AppHelperModule,
        AppConfigModule,
        AppDatabaseModule,
        UserAuthModule,
        UserWebpushModule,
    ],

    exports: [

        NotificationUserService,
    ],

    providers: [

        NotificationUserRepository,
        NotificationUserService,
        NotificationWebpushService,
        NotificationCreatedBroadcastListener,
        NotificationCreatedWebpushListener,
        NotificationWebpushProcessor,
    ],

    controllers: [

        NotificationUserController,
    ],
})
/**
 * @class {NotificationUserModule}
 */
export class NotificationUserModule
{
    //
}
