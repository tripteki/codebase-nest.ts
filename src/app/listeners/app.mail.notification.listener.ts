"use strict";

import { Injectable, } from "@nestjs/common";
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
};
