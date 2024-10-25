"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
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
     * @param {ConfigService} configService
     * @returns {void}
     */
    constructor (
        private readonly configService: ConfigService
    )
    {
        //
    }

    /**
     * @returns {CacheModuleOptions}
     */
    public createCacheOptions (): CacheModuleOptions
    {
        return {

            ... this.configService.get<Object> ("cache"),
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
     * @param {ConfigService} configService
     * @returns {void}
     */
    constructor (
        private readonly configService: ConfigService
    )
    {
        //
    }

    /**
     * {@link https://github.com/redis/node-redis/blob/HEAD/docs/client-configuration.md Redis}
     * @returns {Promise<CacheModuleOptions>}
     */
    public async createCacheOptions (): Promise<CacheModuleOptions>
    {
        return {

            ... this.configService.get<Object> ("cache"),

            store: await redisStore ({

                url: String (process.env.REDIS_URI),
            }),
        };
    }
};
