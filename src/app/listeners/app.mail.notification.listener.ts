"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { MailerService, } from "@nestjs-modules/mailer";

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
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly mailService: MailerService
    )
    {
        //
    }
};
