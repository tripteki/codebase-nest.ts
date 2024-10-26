"use strict";

import configHelper from "src/app/helpers/helper.config";
import fakerHelper from "src/app/helpers/helper.faker";

/**
 * @function
 *
 * @returns {Object}
 */
export const versionFactory = (): Object =>
{
    const

    appConfig = configHelper ("app"),
    faker = fakerHelper (),

    major: number = faker.number.int ({ min: 0, max: 5, }),
    minor: number = faker.number.int ({ min: 6, max: 10, }),
    patch: number = faker.number.int ({ min: 11, max: 15, });

    return {

        tag: `${appConfig.name}:${major}.${minor}.${patch}`,
    };
};
