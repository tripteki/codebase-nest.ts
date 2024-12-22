"use strict";

import { Module, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { MailerModule, } from "@nestjs-modules/mailer";
import { ConfigService, } from "@nestjs/config";
import { MailHbsDriver, } from "src/app/drivers/mail.driver";

@Module ({

    imports: [

        MailerModule.forRootAsync ({

            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],
            useClass: MailHbsDriver,
        }),
    ],

    exports: [

        //
    ],
})
/**
 * @class {AppMailModule}
 */
export class AppMailModule
{
    //
};
