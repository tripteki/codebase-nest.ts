"use strict";

import { ConfigService, } from "@nestjs/config";
import { NestjsHasherService as HashService, } from "@sinuos/nestjs-hasher";
import { BcryptDriverConfigService, ArgonDriverConfigService, } from "../../app/drivers/driver.hasher";
import configHelper from "./helper.config";

/**
 * @function
 *
 * @param {string} type
 * @returns {HashService}
 */
export const hashHelper = (type: string = "bcrypt"): HashService =>
{
    const

    configService = new ConfigService (),
    hashConfig = configHelper ("hash"),
    config = {

        ... (type === "bcrypt"
            ? new BcryptDriverConfigService (configService).createHasherOptions ()
            : type === "argon"
            ? new ArgonDriverConfigService (configService).createHasherOptions ()
            : (() => { throw new Error (`Unsupported hash type: ${type}.`); }) ()),

            ... hashConfig[type],
    };

    return new HashService (config);
};

export default hashHelper;
