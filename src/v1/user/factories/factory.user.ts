"use strict";

import fakerHelper from "src/app/helpers/helper.faker";

/**
 * @function
 *
 * @returns {Record<string, any>}
 */
export const userFactory = (): Record<string, any> =>
{
    const

    faker = fakerHelper ();

    return {

        name: faker.internet.userName (),
        email: faker.internet.email (),
        password: faker.internet.password ({ length: 8, }),
    };
};
