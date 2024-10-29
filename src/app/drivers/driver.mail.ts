"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { MailerOptions, MailerOptionsFactory, } from "@nestjs-modules/mailer";
import { HandlebarsAdapter, } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";

@Injectable ()
/**
 * @class
 * @implements {MailerOptionsFactory}
 */
export class HandlebarsDriverConfigService implements MailerOptionsFactory
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @returns {void}
     */
    constructor (
        private readonly configService: ConfigService,
        private readonly i18nService: I18nService
    )
    {
        //
    }

    /**
     * @returns {CacheModuleOptions}
     */
    public createMailerOptions (): MailerOptions
    {
        return {

            template: {

                adapter: new HandlebarsAdapter ({

                    t: this.i18nService.hbsHelper,
                }),

                options: { strict: true, },
            },

            ... this.configService.get<Record<string, any>> ("mail"),
        };
    }
};
