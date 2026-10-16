import { Request, } from "express";
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Req, UseGuards, } from "@nestjs/common";
import { Throttle as ThrottleMiddleware, ThrottlerGuard as ThrottleGuardMiddleware, } from "@nestjs/throttler";
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags, } from "@nestjs/swagger";
import { AppApiFileDecorator, AppFileDecorator, } from "src/app/decorators/app.file.decorator";
import { AppApiFilterQueryStringDecorator, AppFilterQueryStringDecorator, } from "src/app/decorators/app.filter.decorator";
import { Status, Message, } from "src/app/dtos/app.dto";
import { AppApiCurrentPageQueryStringDecorator, AppApiLimitPageQueryStringDecorator, AppCurrentPageQueryStringDecorator, AppLimitPageQueryStringDecorator, } from "src/app/decorators/app.page.decorator";
import { AppApiOrderQueryStringDecorator, AppOrderQueryStringDecorator, } from "src/app/decorators/app.order.decorator";
import { Filterization, OffsetPagination, Orderization, } from "src/app/repositories/app.repository";
import { RoleIdentifierDto, RoleCreateValidatorDto, RoleUpdateValidatorDto, } from "src/v1/api/acl/dtos/role.validator.dto";
import { RoleTransformerDto, } from "src/v1/api/acl/dtos/role.transformer.dto";
import { RoleAdminService, } from "src/v1/api/acl/services/role.admin.service";
import { UserAuthAccessTokenMetadataMiddleware, } from "src/v1/api/user/dtos/user.auth.enum";
import { UserHttpAuthGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.guard.middleware";
import { UserHttpVerificationGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.verification.guard.middleware";
import { UserHttpPermissionGuardMiddleware, UserPermissionMetadataMiddleware, } from "src/v1/api/user/middlewares/user.permission.guard.middleware";

@ApiTags ("RoleAdmin")
@Controller ("/v1/admin/roles")
/**
 * @class {RoleAdminController}
 */
export class RoleAdminController
{
    /**
     * @param {RoleAdminService} roleAdminService
     * @returns {void}
     */
    constructor (
        protected readonly roleAdminService: RoleAdminService
    )
    {
        //
    }

    @Get ("/")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("role.view")
    @AppApiOrderQueryStringDecorator ("orders")
    @AppApiFilterQueryStringDecorator ("filters")
    @AppApiLimitPageQueryStringDecorator ("limitPage")
    @AppApiCurrentPageQueryStringDecorator ("currentPage")
    @ApiBearerAuth ()
    @ApiResponse ({ status: Status.UNAUTHORIZED, description: Message.UNAUTHORIZED, })
    @ApiResponse ({ status: Status.FORBIDDEN, description: Message.UNVERIFIED, })
    /**
     * @param {Orderization<RoleTransformerDto>[]} orders
     * @param {Filterization<RoleTransformerDto>[]} filters
     * @param {number} limitPage
     * @param {number} currentPage
     * @returns {Promise<OffsetPagination<RoleTransformerDto>>}
     */
    public async index (
        @AppOrderQueryStringDecorator ("orders") orders: Orderization<RoleTransformerDto>[],
        @AppFilterQueryStringDecorator ("filters") filters: Filterization<RoleTransformerDto>[],
        @AppLimitPageQueryStringDecorator ("limitPage") limitPage: number,
        @AppCurrentPageQueryStringDecorator ("currentPage") currentPage: number
    ): Promise<OffsetPagination<RoleTransformerDto>>
    {
        return this.roleAdminService.all (orders, filters, { limitPage, currentPage, });
    }

    @Get ("/:id")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("role.view")
    @ApiBearerAuth ()
    /**
     * @param {RoleIdentifierDto} parameters
     * @returns {Promise<RoleTransformerDto>}
     */
    public async show (
        @Param () parameters: RoleIdentifierDto
    ): Promise<RoleTransformerDto>
    {
        return this.roleAdminService.get (parameters.id);
    }

    @Post ("/")
    @HttpCode (Status.CREATED)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("role.create")
    @ApiBearerAuth ()
    /**
     * @param {Request} request
     * @param {RoleCreateValidatorDto} inputs
     * @returns {Promise<RoleTransformerDto>}
     */
    public async store (
        @Req () request: Request,
        @Body () inputs: RoleCreateValidatorDto
    ): Promise<RoleTransformerDto>
    {
        return this.roleAdminService.create (request["user"].sub, inputs);
    }

    @Put ("/:id")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("role.update")
    @ApiBearerAuth ()
    /**
     * @param {Request} request
     * @param {RoleIdentifierDto} parameters
     * @param {RoleUpdateValidatorDto} inputs
     * @returns {Promise<RoleTransformerDto>}
     */
    public async update (
        @Req () request: Request,
        @Param () parameters: RoleIdentifierDto,
        @Body () inputs: RoleUpdateValidatorDto
    ): Promise<RoleTransformerDto>
    {
        return this.roleAdminService.update (request["user"].sub, parameters.id, inputs);
    }

    @Delete ("/:id")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("role.delete")
    @ApiBearerAuth ()
    /**
     * @param {Request} request
     * @param {RoleIdentifierDto} parameters
     * @returns {Promise<RoleTransformerDto>}
     */
    public async destroy (
        @Req () request: Request,
        @Param () parameters: RoleIdentifierDto
    ): Promise<RoleTransformerDto>
    {
        return this.roleAdminService.delete (request["user"].sub, parameters.id);
    }

    @Post ("/import")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("role.import")
    @AppApiFileDecorator ("file", __dirname + "/../../../../../storage/disks/public/import/")
    @ApiBearerAuth ()
    /**
     * @param {Request} request
     * @param {Express.Multer.File} file
     * @returns {Promise<string>}
     */
    public async import (
        @Req () request: Request,
        @AppFileDecorator () file: Express.Multer.File
    ): Promise<string>
    {
        return this.roleAdminService.import (request["user"].sub, file.filename);
    }

    @Post ("/export")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("role.export")
    @AppApiFilterQueryStringDecorator ("filters")
    @ApiQuery ({ name: "export_type", required: false, enum: [ "csv", "xlsx", ], })
    @ApiBearerAuth ()
    /**
     * @param {Request} request
     * @param {string} exportType
     * @param {Filterization<RoleTransformerDto>[]} filters
     * @returns {Promise<string>}
     */
    public async export (
        @Req () request: Request,
        @Query ("export_type") exportType: string,
        @AppFilterQueryStringDecorator ("filters") filters: Filterization<RoleTransformerDto>[]
    ): Promise<string>
    {
        return this.roleAdminService.export (request["user"].sub, exportType || "csv", filters);
    }
}
