"use strict";

import { join, } from "path";
import { config, } from "dotenv";

/**
 * @function
 *
 * @param {string} compose
 * @returns {any}
 */
export const configHelper = (compose: string): any =>
{
    config ({ path: join (__dirname, "../../../", ".env"), });

    return require (join (__dirname, `../configs/config.${compose}`)).default ();
};

export default configHelper;
