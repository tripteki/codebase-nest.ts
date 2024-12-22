"use strict";

import { registerAs, } from "@nestjs/config";

export default registerAs ("throttle", () => ([

    {
        /**
         * The time-to-live (TTL) for the throttle window.
         * This is the duration (in milliseconds) for which requests are counted in the throttling mechanism.
         * After this period, the count of requests will reset.
         */
        ttl: Number (process.env.THROTTLE_EXPIRATION || 60000),

        /**
         * The number of requests allowed within the throttle window.
         * This sets the limit on the number of requests that can be made within the `ttl` period.
         * If this limit is exceeded, further requests may be delayed or rejected depending on the throttling logic implemented.
         */
        limit: Number (process.env.THROTTLE_LIMIT || 100),
    },

]));
