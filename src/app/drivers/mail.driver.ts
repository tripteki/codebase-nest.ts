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
        const isProduction: boolean = this.configService.get<string> ("app.env") === "production";
        const mailConfig: MailerOptions = this.configService.get<MailerOptions> ("mail");

        let transport: any = mailConfig.transport;

        if (! isProduction) {

            transport = {
                jsonTransport: true,
            };
        } else if (transport && typeof transport === "string") {

            try {

                const url = new URL (transport);
                transport = {
                    host: url.hostname,
                    port: Number (url.port) || (url.protocol === "smtps:" || url.protocol === "smtp:" && url.searchParams.get ("secure") === "true" ? 465 : 587),
                    secure: url.protocol === "smtps:" || url.port === "465" || url.searchParams.get ("secure") === "true",
                    auth: url.username && url.password ? {
                        user: decodeURIComponent (url.username),
                        pass: decodeURIComponent (url.password),
                    } : undefined,
                };
            } catch (error) {

                transport = mailConfig.transport;
            }
        }

        return {

            template: {

                adapter: new HandlebarsAdapter ({

                    t: this.i18nService.hbsHelper,
                }),

                dir: join (__dirname, "../", "views/"),

                options: { strict: true, },
            },

            ... mailConfig,
            transport,
        };
    }
};
