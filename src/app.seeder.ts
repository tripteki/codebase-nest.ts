"use strict";

import { userSeeder, userUnSeeder, } from "./user/user.seeder";

/**
 * @returns {Promise<void>}
 */
(async (): Promise<void> => {

    for (let i = 0; i < 5; i++) {

        await userSeeder ();
    }

}) ().finally (async () => {

    await userUnSeeder ();
});
