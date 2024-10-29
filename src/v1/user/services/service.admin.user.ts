"use strict";

import { Injectable, } from "@nestjs/common";
import { I18nService, I18nContext, } from "nestjs-i18n";
import { CommonRequestDto, } from "src/v1/common/requests/request";
import { CommonResponseDto, } from "src/v1/common/responses/response";
import { CommonService, } from "src/v1/common/services/service";
import { UserEntity, } from "src/v1/user/entities/entity.user";
import { UserAdminRepository, } from "src/v1/user/repositories/repository.admin.user";
import { StoreUserAdminRequestDto, } from "src/v1/user/requests/dto.request.admin.user.store";
import { StoreUserAdminResponseDto, } from "src/v1/user/responses/dto.response.admin.user.store";

@Injectable ()
/**
 * @class
 * @extends {CommonService}
 */
export class UserAdminService extends CommonService
{
    /**
     * @type {string}
     */
    public readonly context: string = "User admin";

    /**
     * @type {string}
     */
    public static readonly tag: string = "User Admin";

    /**
     * @type {string}
     */
    public static readonly sorts: string[] = [
        "id",
        "name",
        "email",
        "email_verified_at",
        "created_at",
        "updated_at",
        "deleted_at",
    ];

    /**
     * @type {string}
     */
    public static readonly filters: string[] = [
        "id",
        "name",
        "email",
        "email_verified_at",
        "created_at",
        "updated_at",
        "deleted_at",
    ];

    /**
     * @param {I18nService} i18nService
     * @param {UserAdminRepository} userAdminRepository
     * @returns {void}
     */
    constructor (
        protected readonly i18nService: I18nService,
        private readonly userAdminRepository: UserAdminRepository
    )
    {
        super (i18nService);
    }

    /**
     * @param {Record<string, any>} querystring
     * @returns {Promise<Record<string, StoreUserAdminResponseDto>[]>}
     */
    public async index (
        querystring: Record<string, any> = {}
    ): Promise<Record<string, StoreUserAdminResponseDto>[]>
    {
        let

        data: Record<string, StoreUserAdminResponseDto>[] = (await this.userAdminRepository.all (querystring)).map (
            (content: UserEntity) => CommonResponseDto.resolve (
                StoreUserAdminResponseDto, content
            )
        );

        return data;
    }

    /**
     * @param {StoreUserAdminRequestDto} storeUserAdminRequestDto
     * @returns {Promise<Record<string, StoreUserAdminResponseDto>>}
     */
    public async store (
        storeUserAdminRequestDto: StoreUserAdminRequestDto
    ): Promise<Record<string, StoreUserAdminResponseDto>>
    {
        let

        content: UserEntity = await this.userAdminRepository.create (
            storeUserAdminRequestDto
        ),
        data: Record<string, StoreUserAdminResponseDto> = CommonResponseDto.resolve (
            StoreUserAdminResponseDto, content
        );

        return data;
    }
};
