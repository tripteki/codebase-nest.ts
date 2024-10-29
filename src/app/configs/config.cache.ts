"use strict";

import { registerAs, } from "@nestjs/config";

export default registerAs ("cache", () => (
{
    /**
     * Cache expiration.
     */
    ttl: Number (5),

    /**
     * Cache accumulate.
     */
    max: Number (100),
}));
