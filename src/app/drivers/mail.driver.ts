"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { MailerOptionsFactory, MailerOptions, } from "@nestjs-modules/mailer";
import { HandlebarsAdapter, } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { join, } from "path";

@Injectable ()
/**
 * @class {MailHbsDriver}
 * @implements {MailerOptionsFactory}
 */
export class MailHbsDriver implements MailerOptionsFactory
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService
    )
    {
        //
    }

    /**
     * @returns {Promise<MailerOptions>}
     */
    public async createMailerOptions (): Promise<MailerOptions>
    {
        return {

            template: {

                adapter: new HandlebarsAdapter ({

                    t: this.i18nService.hbsHelper,
                }),

                dir: join (__dirname, "../", "views/"),

                options: { strict: true, },
            },

            ... this.configService.get<MailerOptions> ("mail"),
        };
    }
};
