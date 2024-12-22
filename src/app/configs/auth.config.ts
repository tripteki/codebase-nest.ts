"use strict";

import { registerAs, } from "@nestjs/config";

export default registerAs ("auth", () => ({

    /*
    |--------------------------------------------------------------------------
    | JWT Authentication Secret
    |--------------------------------------------------------------------------
    |
    | Don't forget to set this in your .env file, as it will be used to sign your tokens.
    | Make sure to set this in your .env file by running `cli secret`.
    |
    */
    secret: String (process.env.APP_SECRET),

    signOptions: {

        /*
        |--------------------------------------------------------------------------
        | JWT Time to Live
        |--------------------------------------------------------------------------
        |
        | Specify the length of time (in seconds) that the token will be valid for.
        | Defaults to 1 hour.
        |
        */
        expiresIn: Number (process.env.JWT_TTL || 3600),
    },

    refreshOptions: {

        /*
        |--------------------------------------------------------------------------
        | JWT Refresh Time to Live
        |--------------------------------------------------------------------------
        |
        | Specify the length of time (in minutes) that the token can be refreshed
        | within. I.E. The user can refresh their token within a 2.5 days window of
        | the original token being created until they must re-auth.
        | Defaults to 2.5 days.
        |
        */
        refreshExpiresIn: Number (process.env.JWT_REFRESH_TTL || 216000),
    },

}));
