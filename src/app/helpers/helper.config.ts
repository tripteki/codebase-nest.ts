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
    config ({

        path: join (__dirname, "../../../", ".env"),
    });

    let namespace: string,
        cfgDirectory: string = ((str, char) => str.lastIndexOf (char) === -1 ? str : str.slice (0, str.lastIndexOf (char))) (compose, "/"),
        cfgFile: string = ((str, char) => str.lastIndexOf (char) === -1 ? str : str.slice (str.lastIndexOf (char) + 1)) (compose, "/");

    if (cfgDirectory === cfgFile) namespace = `../configs`;
    else namespace = `../../${cfgDirectory}/configs`;

    return require (join (__dirname, `${namespace}/config.${cfgFile}`)).default ();
};

export default configHelper;
