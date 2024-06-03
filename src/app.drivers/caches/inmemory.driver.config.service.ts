"use strict";

import { Injectable, } from "@nestjs/common";
import { CacheModuleOptions, CacheOptionsFactory, } from "@nestjs/cache-manager";
import { cacheConfig, } from "config/cache";

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

            ...cacheConfig,
        };
    }
};
