"use strict";

import { HttpStatus, Controller, Body, Query, Get, Post, Put, Patch, Delete, Res, } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, } from "@nestjs/swagger";
import { StandardParams, StandardParam, StandardResponse, } from "nest-standard-response";
import { CommonRequestDto, } from "src/v1/common/requests/request";
import { CommonResponseDto, } from "src/v1/common/responses/response";
import { StoreUserAdminRequestDto, } from "src/v1/user/requests/dto.request.admin.user.store";
import { StoreUserAdminResponseDto, } from "src/v1/user/responses/dto.response.admin.user.store";
import { UserAdminService, } from "src/v1/user/services/service.admin.user";

@ApiTags (UserAdminService.tag)
@Controller ({

    version: "1",
})
/**
 * @class
 */
export class UserAdminController
{
    /**
     * @param {UserAdminService} userAdminService
     * @returns {void}
     */
    constructor (
        private readonly userAdminService: UserAdminService
    )
    {
        //
    }

    @Get ("/admin/users")
    @StandardResponse ({
        type: [ StoreUserAdminResponseDto, ],
        isPaginated: true,
        isSorted: true,
        sortableFields: UserAdminService.sorts,
        isFiltered: true,
        filterableFields: UserAdminService.filters,
    })
    @ApiQuery ({
        name: "lang",
        description: "I18n",
        required: false,
    })
    @ApiOperation ({
        summary: "Index",
    })
    @ApiResponse ({
        status: HttpStatus.OK,
        description: "SUCCESS_INDEXED",
    })
    /**
     * @param {StandardParams} params
     * @returns {Promise<Record<string, StoreUserAdminResponseDto>[]>}
     */
    public async index (
        @StandardParam () params: StandardParams,
        @Query ("sort") sort: string,
        @Query ("filter") filter: string
    ): Promise<Record<string, StoreUserAdminResponseDto>[]>
    {
        CommonRequestDto.resolve (params, this.userAdminService.message ("index"), sort, filter);

        return await this.userAdminService.index ({

            limit: params.paginationInfo.limit,
            offset: params.paginationInfo.offset,
            sort: params.sortingInfo.sort,
        });
    }

    @Post ("/admin/users")
    @ApiQuery ({
        name: "lang",
        description: "I18n",
        required: false,
    })
    @ApiOperation ({
        summary: "Store",
    })
    @ApiResponse ({
        status: HttpStatus.CREATED,
        description: "SUCCESS_STORED",
    })
    @ApiResponse ({
        status: HttpStatus.BAD_REQUEST,
        description: "ERROR_VALIDATION",
    })
    /**
     * @param {StandardParams} params
     * @param {StoreUserAdminRequestDto} storeUserAdminRequestDto
     * @returns {Promise<Record<string, StoreUserAdminResponseDto>>}
     */
    public async store (
        @StandardParam () params: StandardParams,
        @Body () storeUserAdminRequestDto: StoreUserAdminRequestDto
    ): Promise<Record<string, StoreUserAdminResponseDto>>
    {
        CommonRequestDto.resolve (params, this.userAdminService.message ("store"));

        return await this.userAdminService.store (storeUserAdminRequestDto);
    }
};
