"use strict";

import { Module, } from "@nestjs/common";
import { MailerModule, } from "@nestjs-modules/mailer";
import { HandlebarsDriverConfigService, } from "src/app/drivers/driver.mail";
import { ConfigModule, } from "@nestjs/config";
import { ConfigService, } from "@nestjs/config";

@Module ({

    imports: [

        MailerModule.forRootAsync ({

            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],
            useClass: HandlebarsDriverConfigService,
        }),
    ],

    exports: [

        //
    ],
})
/**
 * @class
 */
export class AppMailModule
{
    //
};
