"use strict";

import configHelper from "./helper.config";

/**
 * @function
 *
 * @returns {any}
 */
export const fakerHelper = (): any =>
{
    const

    appConfig = configHelper ("app"),
    { faker, } = require (`@faker-js/faker/locale/${appConfig.fakerLocale}`);

    return faker;
};

export default fakerHelper;
