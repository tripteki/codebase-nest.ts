"use strict";

import { Injectable, } from "@nestjs/common";
import { CacheModuleOptions, CacheOptionsFactory, } from "@nestjs/cache-manager";
import { cacheConfig, } from "config/cache";
import { redisStore, } from "cache-manager-redis-yet";

@Injectable ()
/**
 * @class
 * @implements {CacheOptionsFactory}
 */
export class RedisDriverConfigService implements CacheOptionsFactory
{
    /**
     * @returns {Promise<CacheModuleOptions>}
     */
    public async createCacheOptions (): Promise<CacheModuleOptions>
    {
        return {

            store: await redisStore ({

                url: String (process.env.REDIS_URI),
            }),

            ...cacheConfig,
        };
    }
};
