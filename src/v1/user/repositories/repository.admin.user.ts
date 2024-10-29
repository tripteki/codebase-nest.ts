"use strict";

import { Injectable, Inject, Logger as LogService, } from "@nestjs/common";
import { Cache as CacheService, } from "cache-manager";
import { InjectRepository, } from "@nestjs/typeorm";
import { QueryRunner, Repository, } from "typeorm";
import { CACHE_MANAGER as CacheRepository, } from "@nestjs/cache-manager";
import { CommonRequestDto, } from "src/v1/common/requests/request";
import { CommonResponseDto, } from "src/v1/common/responses/response";
import { CommonRepository, } from "src/v1/common/repositories/repository";
import { UserEntity, } from "src/v1/user/entities/entity.user";

@Injectable ()
/**
 * @class
 * @extends {CommonRepository}
 */
export class UserAdminRepository extends CommonRepository
{
    /**
     * @param {LogService} logService
     * @param {CacheService} cacheRepository
     * @param {Repository<UserEntity>} userRepository
     * @returns {void}
     */
    constructor (
        protected readonly logService: LogService,
        @Inject (CacheRepository) private readonly cacheRepository: CacheService,
        @InjectRepository (UserEntity, "postgreConnection") private readonly userRepository: Repository<UserEntity>
    )
    {
        super (logService);
    }

    /**
     * @param {Record<string, any>} querystring
     * @returns {Promise<UserEntity[]>}
     */
    public async all (querystring: Record<string, any> = {}): Promise<UserEntity[]>
    {
        let

        content: UserEntity[] = await this.userRepository.find ({

            ... CommonRequestDto.resolveQueryPagination ("postgre", querystring),
            ... CommonRequestDto.resolveQuerySort ("postgre", querystring),
        });

        return content;
    }

    /**
     * @param {Record<string, any>} data
     * @returns {Promise<UserEntity|null>}
     */
    public async create (data: Record<string, any>): Promise<UserEntity|null>
    {
        let

        query: QueryRunner = this.userRepository.manager.connection.createQueryRunner (),
        content: UserEntity|null;

        await query.connect ();

        await query.startTransaction ();

        try {

            content = await this.userRepository.save (await this.userRepository.create (data));

            await query.commitTransaction ();

        } catch (exception) {

            await query.rollbackTransaction ();

            await this.logService.log (exception);

        } finally {

            await query.release ();
        }

        return content;
    }
};
