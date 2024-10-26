"use strict";

import { Injectable, Inject, Logger as LogService, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { Cache as CacheService, } from "cache-manager";
import { InjectRepository, } from "@nestjs/typeorm";
import { Repository, } from "typeorm";
import { CACHE_MANAGER as CacheRepository, } from "@nestjs/cache-manager";
import { VersionEntity, } from "src/version/entities/entity.version";

@Injectable ()
/**
 * @class
 */
export class VersionService
{
    /**
     * @param {ConfigService} configService
     * @param {LogService} logService
     * @param {CacheService} cacheRepository
     * @param {Repository<VersionEntity>} versionRepository
     * @returns {void}
     */
    constructor (
        private readonly configService: ConfigService,
        private readonly logService: LogService,
        @Inject (CacheRepository) private readonly cacheRepository: CacheService,
        @InjectRepository (VersionEntity, "postgreConnection") private readonly versionRepository: Repository<VersionEntity>
    )
    {
        //
    }

    /**
     * @returns {Promise<string>}
     */
    async variable (): Promise<string>
    {
        const version: string = this.configService.get<string> ("app.name") + ":" + this.configService.get<string> ("app.version");

        await this.cacheRepository.set ("version", version);
        await this.logService.log (await this.cacheRepository.get ("version"));

        await this.versionRepository.save (await this.versionRepository.create ({ tag: version, }));

        return version;
    }
};
