"use strict";

const { faker, } = require ("@faker-js/faker" + String (process.env.APP_LOCALE ? "/locale/" + process.env.APP_LOCALE : ""));

/**
 * @returns {any}
 */
export const userFactory = (): any =>
({
    name: faker.internet.userName (),
    email: faker.internet.email (),
    password: faker.internet.password ({ length: 8, }),
});
