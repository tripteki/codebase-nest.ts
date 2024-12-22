"use strict";

import { registerAs, } from "@nestjs/config";

export default registerAs ("queue", () => ({

    /**
     * Configuration for specific queue settings.
     * This section can include options such as queue concurrency,
     * job priority, retry strategies, and more.
     */
    settings: {

        //
    },

    /**
     * Configuration for monitoring and metrics related to the queue.
     * This can include settings for tracking job completion times,
     * job success/failure rates, and other performance metrics.
     */
    metrics: {

        //
    },

}));
