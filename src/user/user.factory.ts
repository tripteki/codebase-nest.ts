"use strict";

import { User, } from "./user.type";

const { faker, } = require ("@faker-js/faker" + String (process.env.APP_LOCALE ? "/locale/" + process.env.APP_LOCALE : ""));

/**
 * @returns {User}
 */
export const userFactory = (): User =>
({
    name: faker.internet.userName (),
    email: faker.internet.email (),
    password: faker.internet.password ({ length: 8, }),
});
