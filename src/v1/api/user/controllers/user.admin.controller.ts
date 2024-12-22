import { Controller, Body, Param, Get, Post, Put, Patch, Delete, Res, } from "@nestjs/common";
import { ApiTags, ApiParam, ApiBody, ApiResponse, } from "@nestjs/swagger";
import { OffsetPaginationType, CursorPaginationType, OffsetPagination, CursorPagination, Orderization, Filterization, } from "src/app/repositories/app.repository";
import { AppApiOrderQueryStringDecorator, AppOrderQueryStringDecorator, } from "src/app/decorators/app.order.decorator";
import { AppApiFilterQueryStringDecorator, AppFilterQueryStringDecorator, } from "src/app/decorators/app.filter.decorator";
import { AppApiCurrentPageQueryStringDecorator, AppApiLimitPageQueryStringDecorator, AppLimitPageQueryStringDecorator, AppCurrentPageQueryStringDecorator, } from "src/app/decorators/app.page.decorator";
import { AppApiIndexCrudSpecDecorator, AppApiDestroyCrudSpecDecorator, AppApiShowCrudSpecDecorator, AppApiStoreCrudSpecDecorator, AppApiUpdateCrudSpecDecorator, } from "src/app/decorators/app.crud.decorator";
import { ConfigService, } from "@nestjs/config";
import { UserAdminService, } from "src/v1/api/user/services/user.admin.service";
import { UserTransformerDto, } from "src/v1/api/user/dtos/user.transformer.dto";
import { UserIdentifierDto, UserUpdateValidatorDto, UserCreateValidatorDto, } from "src/v1/api/user/dtos/user.validator.dto";

@ApiTags ("UserAdmin")
@Controller ("/v1/admin/users")
export class UserAdminController
{
    /**
     * @param {ConfigService} configService
     * @param {UserAdminRepository} userAdminRepository
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly userAdminService: UserAdminService
    )
    {
        //
    }

    @Get ("/")
    @AppApiOrderQueryStringDecorator ("orders")
    @AppApiFilterQueryStringDecorator ("filters")
    @AppApiLimitPageQueryStringDecorator ("limitPage")
    @AppApiCurrentPageQueryStringDecorator ("currentPage")
    @AppApiIndexCrudSpecDecorator ()
    /**
     * @param {Orderization<UserTransformerDto>[]} orders
     * @param {Filterization<UserTransformerDto>[]} filters
     * @param {number} limitPage
     * @param {number} currentPage
     * @returns {Promise<UserTransformerDto[]>}
     */
    public async index (
        @AppOrderQueryStringDecorator ("orders") orders: Orderization<UserTransformerDto>[],
        @AppFilterQueryStringDecorator ("filters") filters: Filterization<UserTransformerDto>[],
        @AppLimitPageQueryStringDecorator ("limitPage") limitPage: number,
        @AppCurrentPageQueryStringDecorator ("currentPage") currentPage: number
    ): Promise<OffsetPagination<UserTransformerDto>>
    {
        return await this.userAdminService.all (
            orders,
            filters,
            { limitPage, currentPage, }
        );
    }

    @Get ("/:id")
    @AppApiShowCrudSpecDecorator ("id")
    /**
     * @param {UserIdentifierDto} parameters
     * @returns {Promise<UserTransformerDto | null>}
     */
    public async show (
        @Param () parameters: UserIdentifierDto
    ): Promise<UserTransformerDto | null>
    {
        return await this.userAdminService.get (
            parameters
        );
    }

    @Put ("/:id")
    @AppApiUpdateCrudSpecDecorator ("id", {
        name: "user",
        email: "user@mail.com",
        password: "12345678",
        password_confirmation: "12345678",
    })
    /**
     * @param {UserIdentifierDto} parameters
     * @param {UserUpdateValidatorDto} inputs
     * @returns {Promise<UserTransformerDto | null>}
     */
    public async update (
        @Param () parameters: UserIdentifierDto,
        @Body () inputs: UserUpdateValidatorDto
    ): Promise<UserTransformerDto | null>
    {
        return await this.userAdminService.update (
            parameters,
            inputs
        );
    }

    @Post ("/")
    @AppApiStoreCrudSpecDecorator ({
        name: "user",
        email: "user@mail.com",
        password: "12345678",
        password_confirmation: "12345678",
    })
    /**
     * @param {UserCreateValidatorDto} inputs
     * @returns {Promise<UserTransformerDto | null>}
     */
    public async store (
        @Body () inputs: UserCreateValidatorDto
    ): Promise<UserTransformerDto | null>
    {
        return await this.userAdminService.create (
            inputs
        );
    }

    @Delete ("/activate/:id")
    @AppApiDestroyCrudSpecDecorator ("id")
    /**
     * @param {UserIdentifierDto} parameters
     * @returns {Promise<UserTransformerDto | null>}
     */
    public async activate (
        @Param () parameters: UserIdentifierDto
    ): Promise<UserTransformerDto | null>
    {
        return await this.userAdminService.restore (
            parameters
        );
    }

    @Delete ("/deactivate/:id")
    @AppApiDestroyCrudSpecDecorator ("id")
    /**
     * @param {UserIdentifierDto} parameters
     * @returns {Promise<UserTransformerDto | null>}
     */
    public async deactivate (
        @Param () parameters: UserIdentifierDto
    ): Promise<UserTransformerDto | null>
    {
        return await this.userAdminService.delete (
            parameters
        );
    }
}
