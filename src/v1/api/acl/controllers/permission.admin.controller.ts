import { Request, } from "express";
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Req, UseGuards, } from "@nestjs/common";
import { Throttle as ThrottleMiddleware, ThrottlerGuard as ThrottleGuardMiddleware, } from "@nestjs/throttler";
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags, } from "@nestjs/swagger";
import { AppApiFileDecorator, AppFileDecorator, } from "src/app/decorators/app.file.decorator";
import { Status, Message, } from "src/app/dtos/app.dto";
import { AppApiCurrentPageQueryStringDecorator, AppApiLimitPageQueryStringDecorator, AppCurrentPageQueryStringDecorator, AppLimitPageQueryStringDecorator, } from "src/app/decorators/app.page.decorator";
import { AppApiFilterQueryStringDecorator, AppFilterQueryStringDecorator, } from "src/app/decorators/app.filter.decorator";
import { AppApiOrderQueryStringDecorator, AppOrderQueryStringDecorator, } from "src/app/decorators/app.order.decorator";
import { Filterization, OffsetPagination, Orderization, } from "src/app/repositories/app.repository";
import { PermissionCreateValidatorDto, PermissionIdentifierDto, PermissionUpdateValidatorDto, } from "src/v1/api/acl/dtos/permission.validator.dto";
import { PermissionTransformerDto, } from "src/v1/api/acl/dtos/permission.transformer.dto";
import { PermissionAdminService, } from "src/v1/api/acl/services/permission.admin.service";
import { UserAuthAccessTokenMetadataMiddleware, } from "src/v1/api/user/dtos/user.auth.enum";
import { UserHttpAuthGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.guard.middleware";
import { UserHttpVerificationGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.verification.guard.middleware";
import { UserHttpPermissionGuardMiddleware, UserPermissionMetadataMiddleware, } from "src/v1/api/user/middlewares/user.permission.guard.middleware";

@ApiTags ("PermissionAdmin")
@Controller ("/v1/admin/permissions")
/**
 * @class {PermissionAdminController}
 */
export class PermissionAdminController
{
    /**
     * @param {PermissionAdminService} permissionAdminService
     * @returns {void}
     */
    constructor (
        protected readonly permissionAdminService: PermissionAdminService
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
    @UserPermissionMetadataMiddleware ("permission.view")
    @AppApiOrderQueryStringDecorator ("orders")
    @AppApiFilterQueryStringDecorator ("filters")
    @AppApiLimitPageQueryStringDecorator ("limitPage")
    @AppApiCurrentPageQueryStringDecorator ("currentPage")
    @ApiBearerAuth ()
    @ApiResponse ({ status: Status.UNAUTHORIZED, description: Message.UNAUTHORIZED, })
    @ApiResponse ({ status: Status.FORBIDDEN, description: Message.UNVERIFIED, })
    /**
     * @param {Orderization<PermissionTransformerDto>[]} orders
     * @param {Filterization<PermissionTransformerDto>[]} filters
     * @param {number} limitPage
     * @param {number} currentPage
     * @returns {Promise<OffsetPagination<PermissionTransformerDto>>}
     */
    public async index (
        @AppOrderQueryStringDecorator ("orders") orders: Orderization<PermissionTransformerDto>[],
        @AppFilterQueryStringDecorator ("filters") filters: Filterization<PermissionTransformerDto>[],
        @AppLimitPageQueryStringDecorator ("limitPage", 500) limitPage: number,
        @AppCurrentPageQueryStringDecorator ("currentPage", 500) currentPage: number
    ): Promise<OffsetPagination<PermissionTransformerDto>>
    {
        return this.permissionAdminService.all (orders, filters, { limitPage, currentPage, });
    }

    @Get ("/:id")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("permission.view")
    @ApiBearerAuth ()
    /**
     * @param {PermissionIdentifierDto} parameters
     * @returns {Promise<PermissionTransformerDto>}
     */
    public async show (
        @Param () parameters: PermissionIdentifierDto
    ): Promise<PermissionTransformerDto>
    {
        return this.permissionAdminService.get (parameters.id);
    }

    @Post ("/")
    @HttpCode (Status.CREATED)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("permission.create")
    @ApiBearerAuth ()
    /**
     * @param {Request} request
     * @param {PermissionCreateValidatorDto} inputs
     * @returns {Promise<PermissionTransformerDto>}
     */
    public async store (
        @Req () request: Request,
        @Body () inputs: PermissionCreateValidatorDto
    ): Promise<PermissionTransformerDto>
    {
        return this.permissionAdminService.create (request["user"].sub, inputs);
    }

    @Put ("/:id")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("permission.update")
    @ApiBearerAuth ()
    /**
     * @param {Request} request
     * @param {PermissionIdentifierDto} parameters
     * @param {PermissionUpdateValidatorDto} inputs
     * @returns {Promise<PermissionTransformerDto>}
     */
    public async update (
        @Req () request: Request,
        @Param () parameters: PermissionIdentifierDto,
        @Body () inputs: PermissionUpdateValidatorDto
    ): Promise<PermissionTransformerDto>
    {
        return this.permissionAdminService.update (request["user"].sub, parameters.id, inputs);
    }

    @Delete ("/:id")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("permission.delete")
    @ApiBearerAuth ()
    /**
     * @param {Request} request
     * @param {PermissionIdentifierDto} parameters
     * @returns {Promise<PermissionTransformerDto>}
     */
    public async destroy (
        @Req () request: Request,
        @Param () parameters: PermissionIdentifierDto
    ): Promise<PermissionTransformerDto>
    {
        return this.permissionAdminService.delete (request["user"].sub, parameters.id);
    }

    @Post ("/import")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("permission.import")
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
        return this.permissionAdminService.import (request["user"].sub, file.filename);
    }

    @Post ("/export")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("permission.export")
    @AppApiFilterQueryStringDecorator ("filters")
    @ApiQuery ({ name: "export_type", required: false, enum: [ "csv", "xlsx", ], })
    @ApiBearerAuth ()
    /**
     * @param {Request} request
     * @param {string} exportType
     * @param {Filterization<PermissionTransformerDto>[]} filters
     * @returns {Promise<string>}
     */
    public async export (
        @Req () request: Request,
        @Query ("export_type") exportType: string,
        @AppFilterQueryStringDecorator ("filters") filters: Filterization<PermissionTransformerDto>[]
    ): Promise<string>
    {
        return this.permissionAdminService.export (request["user"].sub, exportType || "csv", filters);
    }
}
