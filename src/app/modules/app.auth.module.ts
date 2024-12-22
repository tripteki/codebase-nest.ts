"use strict";

import { Module, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { JwtModule, } from "@nestjs/jwt";
import { AppHelperModule, } from "src/app/modules/app.helper.module";
import { ConfigService, } from "@nestjs/config";
import { AuthJwtDriver, } from "src/app/drivers/auth.driver";
import { StringHelper, } from "src/app/helpers/string.helper";

@Module ({

    imports: [

        AppHelperModule,

        JwtModule.registerAsync ({

            global: true,
            imports: [ ConfigModule, ],
            inject: [ ConfigService, StringHelper, ],
            useClass: AuthJwtDriver,
        }),
    ],

    exports: [

        //
    ],
})
/**
 * @class {AppAuthModule}
 */
export class AppAuthModule
{
    //
};
