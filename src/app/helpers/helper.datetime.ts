"use strict";

import datetime from "moment-timezone";
import configHelper from "./helper.config";

/**
 * @function
 *
 * @returns {any}
 */
export const datetimeHelper = (): any =>
{
    const

    appConfig = configHelper ("app");

    datetime.tz (appConfig.timezone);
    datetime.locale (appConfig.locale);

    return datetime;
};

/**
 * @function
 *
 * @returns {any}
 */
export const nowHelper = (): any =>
{
    const

    appConfig = configHelper ("app");

    return (datetimeHelper ()) ().format (appConfig.datetimeFormat);
};

export default nowHelper;
