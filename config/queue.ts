"use strict";

import {

    configNamespace,
    Str,
    QueueOptions,

} from "@intentjs/core";

export default configNamespace ("queue", (): QueueOptions => ({

    /**
     * -----------------------------------------------------
     * Default Queue Driver
     * -----------------------------------------------------
     * Documentation - https://tryintent.com/docs/queues
     *
     * This value is the name of the default queue driver.
     * This will be used to determine the messag queue where
     * the message should be processed.
     */
    default: process.env.DEFAULT_QUEUE || "db",

    /**
     * -----------------------------------------------------
     * Queue Drivers
     * -----------------------------------------------------
     * Documentation - https://tryintent.com/docs/queues
     *
     * You can define different queue connections inside the
     * "connections" attribute.
     *
     * Available Queue Drivers: "sync", "sqs", "redis", "db".
     */
    connections: {

        sync: {

            driver: "sync",
            listenerType: "poll",
        },

        redis: {

            driver: "redis",
            listenerType: "poll",
            queue: process.env.QUEUE_NAME,
            host: process.env.REDIS_HOST || "127.0.0.1",
            port: Number (process.env.REDIS_PORT || 6379),
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD || undefined,
            database: Number (process.env.REDIS_DB || 0),
            prefix: Str.slug (process.env.APP_NAME)+"_queue_",
        },

        db: {

            driver: "db",
            listenerType: "poll",
            table: "jobs",
            queue: "default",
        },
    },

}));
