"use strict";

import { Injectable, Logger, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { MailerService, } from "@nestjs-modules/mailer";
import { UrlHelper, } from "src/app/helpers/url.helper";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";

@Injectable ()
/**
 * @class {AppMailNotificationListener}
 * @abstract {AppMailNotificationListener}
 */
export abstract class AppMailNotificationListener
{
    /**
     * @type {Logger}
     */
    protected readonly logger: Logger = new Logger (this.constructor.name);

    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {MailerService} mailService
     * @param {UrlHelper} urlHelper
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly mailService: MailerService,
        protected readonly urlHelper: UrlHelper,
        protected readonly prismaPostgreService: DatabasePrismaPostgreDriver
    )
    {
        //
    }

    /**
     * @param {any} mailOptions
     * @returns {Promise<void>}
     */
    protected async sendMail (mailOptions: any): Promise<void>
    {
        const transport = String (this.configService.get<string> ("mail.transport") || "").trim ();
        const configured = transport.length > 0 && transport !== "undefined";
        const context = await this.mailContext (mailOptions.context || {});
        const options = { ... mailOptions, context, };

        if (! configured) {

            this.logger.warn (`mail not configured; skip send to=${options.to} subject=${options.subject}`);

            return;
        }

        const isProduction: boolean = this.configService.get<string> ("app.env") === "production";

        if (isProduction) {

            await this.mailService.sendMail (options);

        } else {

            this.logger.log (`[EMAIL] To: ${options.to}`);
            this.logger.log (`[EMAIL] Subject: ${options.subject}`);
            this.logger.log (`[EMAIL] Template: ${options.template}`);
            this.logger.log (`[EMAIL] Context: ${JSON.stringify (options.context, null, 2)}`);
        }
    }

    /**
     * @param {Record<string, unknown>} context
     * @returns {Promise<Record<string, unknown>>}
     */
    protected async mailContext (context: Record<string, unknown>): Promise<Record<string, unknown>>
    {
        const next = { ... context, };
        const appName = this.configService.get<string> ("app.name");
        const frontendUrl = String (this.configService.get<string> ("app.frontendUrl") || "").replace (/\/$/, "");

        if (next.app_name == null) next.app_name = appName;
        if (frontendUrl && next.logo_url == null) next.logo_url = `${frontendUrl}/manifest/asset/logo.png`;
        if (next.primary_color == null) next.primary_color = await this.mailPrimaryColor ();
        if (next.year == null) next.year = new Date ().getFullYear ();
        if (next.header_badge == null) next.header_badge = appName;
        if (next.mail_user_information == null) next.mail_user_information = this.i18nService.t ("_v1_user.mail.user_information");
        if (next.mail_full_name == null) next.mail_full_name = this.i18nService.t ("_v1_user.mail.full_name");
        if (next.mail_email_address == null) next.mail_email_address = this.i18nService.t ("_v1_user.mail.email_address");
        if (next.mail_thanks == null) next.mail_thanks = this.i18nService.t ("_v1_user.mail.thanks");
        if (next.mail_rights == null) next.mail_rights = this.i18nService.t ("_v1_user.mail.rights");

        const branded = await this.mailBrandName ();

        if (branded) {
            next.app_name = branded;
            next.header_badge = branded;
        }

        return next;
    }

    /**
     * @returns {Promise<string>}
     */
    protected async mailBrandName (): Promise<string>
    {
        try {

            const setting = await this.prismaPostgreService.setting.findFirst ({
                where: { key: "APP_NAME", deleted_at: null, },
            });

            return String (setting?.value || "").trim ();

        } catch {

            return "";
        }
    }

    /**
     * @returns {Promise<string>}
     */
    protected async mailPrimaryColor (): Promise<string>
    {
        const fallback = "#2563eb";

        try {

            const setting = await this.prismaPostgreService.setting.findFirst ({
                where: { key: "COLOR_PRIMARY", deleted_at: null, },
            });
            const raw = String (setting?.value || "").trim ();

            if (! raw) return fallback;

            let color = raw.startsWith ("#") ? raw : `#${raw}`;

            if (/^#[0-9a-fA-F]{3}$/.test (color)) {

                color = `#${color.slice (1).split ("").map ((ch) => ch + ch).join ("")}`;
            }

            if (! /^#[0-9a-fA-F]{6}$/.test (color)) return fallback;

            return color.toLowerCase ();

        } catch (error: any) {

            return fallback;
        }
    }
};
