"use strict";

import {

    configNamespace,

} from "@intentjs/core";

export default configNamespace ("auth", () => ({

    /**
     * -----------------------------------------------------
     * JWT SECRET
     * -----------------------------------------------------
     *
     * This value is the secret of the JWT token.
     * It is used to sign the JWT and should be kept
     * secure and private.
     */
    secret: process.env.JWT_SECRET,

    /**
     * -----------------------------------------------------
     * JWT TTL (Time-To-Live)
     * -----------------------------------------------------
     *
     * This value determines the lifetime of the JWT token.
     * The JWT will expire after this duration.
     */
    ttl: process.env.JWT_TTL || "3h",

    /**
     * -----------------------------------------------------
     * OTP Length
     * -----------------------------------------------------
     *
     * The length of the OTP (One-Time Password) generated
     * when performing password reset.
     * Default value is 6 characters.
     */
    otpLength: 6,

    /**
     * -----------------------------------------------------
     * OTP Expiry
     * -----------------------------------------------------
     *
     * The time (in seconds) before the OTP expires.
     * Default is 600 seconds (10 minutes).
     */
    otpExpiry: 600,

}));
