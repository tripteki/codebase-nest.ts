"use strict";

import { registerAs, } from "@nestjs/config";

export default registerAs ("cache", () => (
{
    /**
     * Cache expiration.
     */
    ttl: Number (5),

    /**
     * Items.
     */
    max: Number (100),
}));
