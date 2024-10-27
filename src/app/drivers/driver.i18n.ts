"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nOptions, I18nOptionResolver, I18nOptionsFactory, AcceptLanguageResolver, QueryResolver, HeaderResolver, } from "nestjs-i18n";
import { join, } from "path";

@Injectable ()
/**
 * @class
 * @implements {I18nOptionsFactory}
 */
export class I18nDriverConfigService implements I18nOptionsFactory
{
    /**
     * @param {ConfigService} configService
     * @returns {void}
     */
    constructor (
        private readonly configService: ConfigService
    )
    {
        //
    }

    /**
     * @returns {I18nOptionResolver[]}
     */
    public static createI18nResolvers (): I18nOptionResolver[]
    {
        return [

            { use: QueryResolver, options: [ "lang", ], },
            AcceptLanguageResolver,
            new HeaderResolver([ "x-lang", ]),
        ];
    }

    /**
     * @returns {I18nOptions}
     */
    public createI18nOptions (): I18nOptions
    {
        return {

            loaderOptions: {

                path: join (__dirname, "../", "langs/"),
                watch: true,
            },

            fallbackLanguage: this.configService.get<string> ("app.fallbackLocale"),
        };
    }
};
