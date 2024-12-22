"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { AppHelperContract, } from "src/app/contracts/app.helper.contract";
import datetimeHelper from "moment-timezone";

@Injectable ()
/**
 * @class {DateTimeHelper}
 * @implements {AppHelperContract}
 */
export class DateTimeHelper implements AppHelperContract
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
     * @returns {any}
     */
    public ref (): any
    {
        let locale: string = this.configService.get<string> ("app.fakerLocale") ||
                             this.configService.get<string> ("app.locale") ||
                             this.configService.get<string> ("app.fallbackLocale"),
            timezone: string = this.configService.get<string> ("app.timezone");

        datetimeHelper.tz (timezone);
        datetimeHelper.locale (locale);

        return datetimeHelper;
    }

    /**
     * @returns {Date}
     */
    public now (): Date
    {
        let ref = (this.ref ()) ();

        return new Date (Date.UTC (
            ref.year (),
            ref.month (),
            ref.date (),
            ref.hour (),
            ref.minute (),
            ref.second ()
        ));
    }

    /**
     * @returns {string}
     */
    public nowString (): string
    {
        let ref = (this.ref ()) (),
            datetimeFormat: string = this.configService.get<string> ("app.datetimeFormat");

        return ref.format (datetimeFormat);
    }
};
