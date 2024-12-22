"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { NotificationUserService, } from "src/v1/api/notification/services/notification.user.service";

@Injectable ()
/**
 * @class {AppDatabaseNotificationListener}
 * @abstract {AppDatabaseNotificationListener}
 */
export abstract class AppDatabaseNotificationListener
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {NotificationUserService} notificationService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly notificationService: NotificationUserService
    )
    {
        //
    }
};
