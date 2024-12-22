import { Request, Response, } from "express";
import { Controller, HttpCode, Body, Param, Query, Get, Post, Put, Patch, Delete, Req, Res, UseGuards, } from "@nestjs/common";
import { ApiTags, ApiParam, ApiQuery, ApiBody, ApiResponse, ApiBearerAuth, ApiOperation, } from "@nestjs/swagger";
import { Status, Message, } from "src/app/dtos/app.dto";
import { OffsetPaginationType, CursorPaginationType, OffsetPagination, CursorPagination, Orderization, Filterization, } from "src/app/repositories/app.repository";
import { AppApiOrderQueryStringDecorator, AppOrderQueryStringDecorator, } from "src/app/decorators/app.order.decorator";
import { AppApiFilterQueryStringDecorator, AppFilterQueryStringDecorator, } from "src/app/decorators/app.filter.decorator";
import { AppApiCurrentPageQueryStringDecorator, AppApiLimitPageQueryStringDecorator, AppLimitPageQueryStringDecorator, AppCurrentPageQueryStringDecorator, } from "src/app/decorators/app.page.decorator";
import { AppApiFileDecorator, AppFileDecorator, } from "src/app/decorators/app.file.decorator";
import { AppApiIndexCrudSpecDecorator, AppApiDestroyCrudSpecDecorator, AppApiShowCrudSpecDecorator, AppApiStoreCrudSpecDecorator, AppApiUpdateCrudSpecDecorator, } from "src/app/decorators/app.crud.decorator";
import { ConfigService, } from "@nestjs/config";
import { UserAdminService, } from "src/v1/api/user/services/user.admin.service";
import { UserTransformerDto, } from "src/v1/api/user/dtos/user.transformer.dto";
import { UserIdentifierDto, UserUpdateValidatorDto, UserCreateValidatorDto, UserExportTypeDto, } from "src/v1/api/user/dtos/user.validator.dto";
import { UserAuthAccessTokenMetadataMiddleware, UserAuthRefreshTokenMetadataMiddleware, } from "src/v1/api/user/dtos/user.auth.enum";
import { UserImportDescription, UserExportDescription, } from "src/v1/api/user/dtos/user.api.dto";
import { UserHttpAuthGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.guard.middleware";
import { UserHttpVerificationGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.verification.guard.middleware";

@ApiTags ("UserAdmin")
@Controller ("/v1/admin/users")
export class UserAdminController
{
    /**
     * @param {ConfigService} configService
     * @param {UserAdminService} userAdminService
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
    @HttpCode (Status.OK)
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @AppApiOrderQueryStringDecorator ("orders")
    @AppApiFilterQueryStringDecorator ("filters")
    @AppApiLimitPageQueryStringDecorator ("limitPage")
    @AppApiCurrentPageQueryStringDecorator ("currentPage")
    @AppApiIndexCrudSpecDecorator ()
    @ApiBearerAuth ()
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNVERIFIED,
    })
    /**
     * @param {Request} request
     * @param {Response} response
     * @param {Orderization<UserTransformerDto>[]} orders
     * @param {Filterization<UserTransformerDto>[]} filters
     * @param {number} limitPage
     * @param {number} currentPage
     * @returns {Promise<UserTransformerDto[]>}
     */
    public async index (
        @Req () request: Request,
        @AppOrderQueryStringDecorator ("orders") orders: Orderization<UserTransformerDto>[],
        @AppFilterQueryStringDecorator ("filters") filters: Filterization<UserTransformerDto>[],
        @AppLimitPageQueryStringDecorator ("limitPage") limitPage: number,
        @AppCurrentPageQueryStringDecorator ("currentPage") currentPage: number
    ): Promise<OffsetPagination<UserTransformerDto>>
    {
        return await this.userAdminService.all (
            { userId: request["user"].sub, },
            orders,
            filters,
            { limitPage, currentPage, }
        );
    }

    @Get ("/:id")
    @HttpCode (Status.OK)
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @AppApiShowCrudSpecDecorator ("id")
    @ApiBearerAuth ()
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNVERIFIED,
    })
    /**
     * @param {Request} request
     * @param {Response} response
     * @param {UserIdentifierDto} parameters
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async show (
        @Req () request: Request,
        @Param () parameters: UserIdentifierDto
    ): Promise<UserTransformerDto | string>
    {
        return await this.userAdminService.get (
            { userId: request["user"].sub, },
            parameters
        );
    }

    @Put ("/:id")
    @HttpCode (Status.OK)
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @AppApiUpdateCrudSpecDecorator ("id", {
        name: "user",
        email: "user@mail.com",
        password: "12345678",
        password_confirmation: "12345678",
    })
    @ApiBearerAuth ()
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNVERIFIED,
    })
    /**
     * @param {Request} request
     * @param {Response} response
     * @param {UserIdentifierDto} parameters
     * @param {UserUpdateValidatorDto} inputs
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async update (
        @Req () request: Request,
        @Param () parameters: UserIdentifierDto,
        @Body () inputs: UserUpdateValidatorDto
    ): Promise<UserTransformerDto | string>
    {
        return await this.userAdminService.update (
            { userId: request["user"].sub, },
            parameters,
            inputs
        );
    }

    @Post ("/")
    @HttpCode (Status.CREATED)
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @AppApiStoreCrudSpecDecorator ({
        name: "user",
        email: "user@mail.com",
        password: "12345678",
        password_confirmation: "12345678",
    })
    @ApiBearerAuth ()
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNVERIFIED,
    })
    /**
     * @param {Request} request
     * @param {Response} response
     * @param {UserCreateValidatorDto} inputs
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async store (
        @Req () request: Request,
        @Body () inputs: UserCreateValidatorDto
    ): Promise<UserTransformerDto | string>
    {
        return await this.userAdminService.create (
            { userId: request["user"].sub, },
            inputs
        );
    }

    @Delete ("/activate/:id")
    @HttpCode (Status.OK)
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @AppApiDestroyCrudSpecDecorator ("id")
    @ApiBearerAuth ()
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNVERIFIED,
    })
    /**
     * @param {Request} request
     * @param {Response} response
     * @param {UserIdentifierDto} parameters
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async activate (
        @Req () request: Request,
        @Param () parameters: UserIdentifierDto
    ): Promise<UserTransformerDto | string>
    {
        return await this.userAdminService.restore (
            { userId: request["user"].sub, },
            parameters
        );
    }

    @Delete ("/deactivate/:id")
    @HttpCode (Status.OK)
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @AppApiDestroyCrudSpecDecorator ("id")
    @ApiBearerAuth ()
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNVERIFIED,
    })
    /**
     * @param {Request} request
     * @param {Response} response
     * @param {UserIdentifierDto} parameters
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async deactivate (
        @Req () request: Request,
        @Param () parameters: UserIdentifierDto
    ): Promise<UserTransformerDto | string>
    {
        return await this.userAdminService.delete (
            { userId: request["user"].sub, },
            parameters
        );
    }

    @Put ("/verify/:id")
    @HttpCode (Status.OK)
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiParam ({
        name: "id",
        required: true,
        type: String,
        description: "The identifier",
    })
    @ApiResponse ({
        status: Status.OK,
        description: Message.OK,
    })
    @ApiResponse ({
        status: Status.BAD_REQUEST,
        description: Message.UNVALIDATED,
    })
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNVERIFIED,
    })
    /**
     * @param {Request} request
     * @param {Response} response
     * @param {UserIdentifierDto} parameters
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async verify (
        @Req () request: Request,
        @Param () parameters: UserIdentifierDto
    ): Promise<UserTransformerDto | string>
    {
        return await this.userAdminService.verify (
            { userId: request["user"].sub, },
            parameters
        );
    }

    @Post ("/import")
    @HttpCode (Status.OK)
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @AppApiFileDecorator ("file", __dirname + "/../../../../../storage/disks/public/import/")
    @ApiBearerAuth ()
    @ApiOperation ({
        description: UserImportDescription,
    })
    @ApiResponse ({
        status: Status.OK,
        description: Message.OK,
    })
    @ApiResponse ({
        status: Status.BAD_REQUEST,
        description: Message.UNVALIDATED,
    })
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNVERIFIED,
    })
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
        return await this.userAdminService.import (
            { userId: request["user"].sub, },
            file.filename
        );
    }

    @Post ("/export")
    @HttpCode (Status.OK)
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiQuery ({
        name: "type",
        required: false,
        enum: [ "csv", "xls", "xlsx", ],
        description: "File format: csv (default), xlsx, or xls",
        example: "csv",
    })
    @ApiBearerAuth ()
    @ApiOperation ({
        description: UserExportDescription,
    })
    @ApiResponse ({
        status: Status.OK,
        description: Message.OK,
    })
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNVERIFIED,
    })
    /**
     * @param {Request} request
     * @param {UserExportTypeDto} query
     * @returns {Promise<string>}
     */
    public async export (
        @Req () request: Request,
        @Query () query: UserExportTypeDto
    ): Promise<string>
    {
        return await this.userAdminService.export (
            { userId: request["user"].sub, },
            query.type || "csv"
        );
    }
}
