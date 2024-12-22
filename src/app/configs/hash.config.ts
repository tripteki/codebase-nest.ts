"use strict";

import { registerAs, } from "@nestjs/config";
import {

    HasherBcryptDriver,
    HasherArgonDriver,

} from "src/app/drivers/hasher.driver";

export default registerAs ("hash", () => ({

    /**
     * -----------------------------------------------------
     * Hash Driver
     * -----------------------------------------------------
     *
     * Specifies the hashing algorithm to be used for password encryption.
     * Supported options may include bcrypt, argon, and others.
     */
    driver: "bcrypt",

    /**
     * -----------------------------------------------------
     * Hash Round
     * -----------------------------------------------------
     *
     * Defines the number of iterations (or rounds) to be used in the hashing process.
     * A higher number of rounds increases the time complexity and makes the hash more secure.
     */
    round: 10,

}));
