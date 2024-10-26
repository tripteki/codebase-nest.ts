"use strict";

import configHelper from "src/app/helpers/helper.config";

/**
 * @function
 *
 * @returns {any}
 */
export const fakerHelper = (): any =>
{
    const

    appConfig = configHelper ("app"),
    { faker, } = require (`@faker-js/faker/locale/${appConfig.locale}`);

    return faker;
};

export default fakerHelper;
