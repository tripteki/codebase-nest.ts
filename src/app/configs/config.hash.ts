"use strict";

import { registerAs, } from "@nestjs/config";

export default registerAs ("hash", () => (
{
    /**
     * [See for more detail.](https://www.npmjs.com/package/bcrypt).
     */
    bcrypt: {

        round: 10,
    },

    /**
     * [See for more detail.](https://www.npmjs.com/package/argon2).
     */
    argon: {

        //
    },
}));
