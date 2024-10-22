"use strict";

import { Injectable, } from "@nestjs/common";
import { CacheModuleOptions, CacheOptionsFactory, } from "@nestjs/cache-manager";
import { redisStore, } from "cache-manager-redis-yet";

@Injectable ()
/**
 * @class
 * @implements {CacheOptionsFactory}
 */
export class InmemoryDriverConfigService implements CacheOptionsFactory
{
    /**
     * @returns {CacheModuleOptions}
     */
    public createCacheOptions (): CacheModuleOptions
    {
        return {

            //
        };
    }
};

@Injectable ()
/**
 * @class
 * @implements {CacheOptionsFactory}
 */
export class RedisDriverConfigService implements CacheOptionsFactory
{
    /**
     * {@link https://github.com/redis/node-redis/blob/HEAD/docs/client-configuration.md Redis}
     * @returns {Promise<CacheModuleOptions>}
     */
    public async createCacheOptions (): Promise<CacheModuleOptions>
    {
        return {

            store: await redisStore ({

                url: String (process.env.REDIS_URI),
            }),
        };
    }
};
