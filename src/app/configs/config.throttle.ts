"use strict";

import { registerAs, } from "@nestjs/config";

export default registerAs ("throttle", () => ([

    {
        /**
         * Throttle expiration.
         */
        ttl: Number (process.env.THROTTLE_EXPIRATION || 60000),

        /**
         * Throttle limit.
         */
        limit: Number (process.env.THROTTLE_LIMIT || 10),
    }
]));
