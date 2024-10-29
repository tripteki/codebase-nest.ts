"use strict";

import { TypeOrmQueryService } from "@nestjs-query/query-typeorm";
import { Injectable, } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { I18nService, I18nContext, } from "nestjs-i18n";
import { UserEntity, } from "src/v1/user/entities/entity.user";
import { Repository } from "typeorm";

@Injectable ()
/**
 * @class
 * @extends {TypeOrmQueryService<UserEntity>}
 */
export class UserAdminServiceGraphql extends TypeOrmQueryService<UserEntity>
{
    /**
     * @param {I18nService} i18nService
     * @param {UserAdminRepository} userAdminRepository
     * @returns {void}
     */
    constructor (
        protected readonly i18nService: I18nService,
        @InjectRepository (UserEntity, "postgreConnection") public readonly repo: Repository<UserEntity>
    )
    {
        super (repo, { useSoftDelete: true, });
    }
};
