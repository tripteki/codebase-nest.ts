"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nOptionsFactory, I18nOptionsWithoutResolvers, I18nOptionResolver, QueryResolver, AcceptLanguageResolver, HeaderResolver, } from "nestjs-i18n";
import { join, } from "path";

/**
 * @class {I18NFileDriver}
 * @implements {I18nOptionsFactory}
 */
export class I18NFileDriver implements I18nOptionsFactory
{
    /**
     * @param {ConfigService} configService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService
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
            new HeaderResolver ([ "x-lang", ]),
        ];
    }

    /**
     * @returns {Promise<I18nOptionsWithoutResolvers>}
     */
    public async createI18nOptions (): Promise<I18nOptionsWithoutResolvers>
    {
        return {

            loaderOptions: {

                path: join (__dirname, "../", "langs/"),
                watch: true,
            },

            logging: true,

            viewEngine: "hbs",

            fallbackLanguage: this.configService.get<string> ("app.fallbackLocale"),
        };
    }
};
