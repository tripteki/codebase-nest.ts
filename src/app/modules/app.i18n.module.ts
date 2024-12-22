"use strict";

import { Module, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { I18nModule, I18nOptionsWithoutResolvers, } from "nestjs-i18n";
import { ConfigService, } from "@nestjs/config";
import { I18NFileDriver, } from "src/app/drivers/i18n.driver";

@Module ({

    imports: [

        I18nModule.forRootAsync ({

            resolvers: I18NFileDriver.createI18nResolvers (),
            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],

            useFactory: async (configService: ConfigService): Promise<I18nOptionsWithoutResolvers> => ({

                ... (await (new I18NFileDriver (configService).createI18nOptions ())),
            }),
        }),
    ],

    exports: [

        //
    ],
})
/**
 * @class {AppI18NModule}
 */
export class AppI18NModule
{
    //
};
