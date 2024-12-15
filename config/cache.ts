"use strict";

import {

    configNamespace,
    Str,
    CacheOptions,

} from "@intentjs/core";

export default configNamespace ("cache", (): CacheOptions => ({

    /**
     * -----------------------------------------------------
     * Default Cache Store
     * -----------------------------------------------------
     * Documentation - https://tryintent.com/docs/cache
     *
     * This value is the name of the default cache store. This
     * will be used when you use the `Cache` facade to access
     * your cache.
     */
    default: process.env.DEFAULT_CACHE || "memory",

    /**
     * -----------------------------------------------------
     * Cache Stores
     * -----------------------------------------------------
     *
     * Inside "stores" you can configure all of your different
     * cache stores that you would want to use in your application.
     *
     * Drivers: "memory", "redis".
     */
    stores: {

        memory: {

            driver: "memory",
            prefix: Str.slug (process.env.APP_NAME)+"_cache_",
        },

        redis: {

            driver: "redis",
            host: process.env.REDIS_HOST || "127.0.0.1",
            port: Number (process.env.REDIS_PORT || 6379),
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD || undefined,
            database: Number (process.env.REDIS_DB || 0),
            prefix: Str.slug (process.env.APP_NAME)+"_cache_",
        },
    },

}));
