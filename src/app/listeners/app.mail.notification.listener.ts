"use strict";

import { Injectable, Logger, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { MailerService, } from "@nestjs-modules/mailer";
import { UrlHelper, } from "src/app/helpers/url.helper";

@Injectable ()
/**
 * @class {AppMailNotificationListener}
 * @abstract {AppMailNotificationListener}
 */
export abstract class AppMailNotificationListener
{
    protected readonly logger: Logger = new Logger (this.constructor.name);

    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {MailerService} mailService
     * @param {UrlHelper} urlHelper
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly mailService: MailerService,
        protected readonly urlHelper: UrlHelper
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
        const isProduction: boolean = this.configService.get<string> ("app.env") === "production";

        if (isProduction) {

            await this.mailService.sendMail (mailOptions);

        } else {

            this.logger.log (`[EMAIL] To: ${mailOptions.to}`);
            this.logger.log (`[EMAIL] Subject: ${mailOptions.subject}`);
            this.logger.log (`[EMAIL] Template: ${mailOptions.template}`);
            this.logger.log (`[EMAIL] Context: ${JSON.stringify (mailOptions.context, null, 2)}`);
        }
    }
};
