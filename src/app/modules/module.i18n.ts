"use strict";

import { Module, } from "@nestjs/common";
import { I18nModule, } from "nestjs-i18n";
import { I18nDriverConfigService, } from "src/app/drivers/driver.i18n";
import { ConfigModule, } from "@nestjs/config";
import { ConfigService, } from "@nestjs/config";

@Module ({

    imports: [

        I18nModule.forRootAsync ({

            resolvers: I18nDriverConfigService.createI18nResolvers (),
            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],

            useFactory: async (configService: ConfigService) => ({

                ... (await (new I18nDriverConfigService (configService).createI18nOptions ())),
            }),
        }),
    ],

    exports: [

        //
    ],
})
/**
 * @class
 */
export class AppI18nModule
{
    //
};
