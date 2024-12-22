"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { CacheOptionsFactory, CacheModuleOptions, CacheOptions, } from "@nestjs/cache-manager";
import { redisStore, } from "cache-manager-redis-yet";
import { StringHelper, } from "src/app/helpers/string.helper";

@Injectable ()
/**
 * @class {MemoryInmemoryDriver}
 * @implements {CacheOptionsFactory}
 */
export class MemoryInmemoryDriver implements CacheOptionsFactory
{
    /**
     * @param {ConfigService} configService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService
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

            ... this.configService.get<CacheOptions> ("cache"),
        };
    }
};

@Injectable ()
/**
 * @class {MemoryRedisDriver}
 * @implements {CacheOptionsFactory}
 */
export class MemoryRedisDriver implements CacheOptionsFactory
{
    /**
     * @param {ConfigService} configService
     * @param {StringHelper} stringHelper
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        private readonly stringHelper: StringHelper
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

            ... this.configService.get<CacheOptions> ("cache"),

            store: await redisStore ({

                socket: {

                    host: String (process.env.MEMORY_CACHE_REDIS_HOST || process.env.MEMORY_REDIS_HOST),
                    port: Number (process.env.MEMORY_CACHE_REDIS_PORT || process.env.MEMORY_REDIS_PORT),
                },

                username: String (process.env.MEMORY_CACHE_REDIS_USERNAME || process.env.MEMORY_REDIS_USERNAME),
                password: String (process.env.MEMORY_CACHE_REDIS_PASSWORD || process.env.MEMORY_REDIS_PASSWORD),
                database: Number (process.env.MEMORY_CACHE_REDIS_DATABASE || process.env.MEMORY_REDIS_DATABASE),
                keyPrefix: this.stringHelper.ref ().slug (this.configService.get<string> ("app.name"), "_") + "_cache_",
            }),
        };
    }
};
