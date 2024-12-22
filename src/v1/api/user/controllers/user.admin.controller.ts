import { Request, Response, } from "express";
import { Controller, HttpCode, Body, Param, Get, Post, Put, Patch, Delete, Req, Res, UseGuards, } from "@nestjs/common";
import { ApiTags, ApiParam, ApiBody, ApiResponse, ApiBearerAuth, } from "@nestjs/swagger";
import { OffsetPaginationType, CursorPaginationType, OffsetPagination, CursorPagination, Orderization, Filterization, } from "src/app/repositories/app.repository";
import { AppApiOrderQueryStringDecorator, AppOrderQueryStringDecorator, } from "src/app/decorators/app.order.decorator";
import { AppApiFilterQueryStringDecorator, AppFilterQueryStringDecorator, } from "src/app/decorators/app.filter.decorator";
import { AppApiCurrentPageQueryStringDecorator, AppApiLimitPageQueryStringDecorator, AppLimitPageQueryStringDecorator, AppCurrentPageQueryStringDecorator, } from "src/app/decorators/app.page.decorator";
import { AppApiIndexCrudSpecDecorator, AppApiDestroyCrudSpecDecorator, AppApiShowCrudSpecDecorator, AppApiStoreCrudSpecDecorator, AppApiUpdateCrudSpecDecorator, } from "src/app/decorators/app.crud.decorator";
import { ConfigService, } from "@nestjs/config";
import { UserAdminService, } from "src/v1/api/user/services/user.admin.service";
import { UserTransformerDto, } from "src/v1/api/user/dtos/user.transformer.dto";
import { UserIdentifierDto, UserUpdateValidatorDto, UserCreateValidatorDto, } from "src/v1/api/user/dtos/user.validator.dto";
import { UserAuthAccessTokenMetadataMiddleware, UserAuthRefreshTokenMetadataMiddleware, } from "src/v1/api/user/dtos/user.auth.enum";
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
    @HttpCode (200)
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiResponse ({
        status: 401,
        description: "Unauthorized",
    })
    @ApiResponse ({
        status: 403,
        description: "Unverified",
    })
    @AppApiOrderQueryStringDecorator ("orders")
    @AppApiFilterQueryStringDecorator ("filters")
    @AppApiLimitPageQueryStringDecorator ("limitPage")
    @AppApiCurrentPageQueryStringDecorator ("currentPage")
    @AppApiIndexCrudSpecDecorator ()
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
    @HttpCode (200)
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiResponse ({
        status: 401,
        description: "Unauthorized",
    })
    @ApiResponse ({
        status: 403,
        description: "Unverified",
    })
    @AppApiShowCrudSpecDecorator ("id")
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
    @HttpCode (200)
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiResponse ({
        status: 401,
        description: "Unauthorized",
    })
    @ApiResponse ({
        status: 403,
        description: "Unverified",
    })
    @AppApiUpdateCrudSpecDecorator ("id", {
        name: "user",
        email: "user@mail.com",
        password: "12345678",
        password_confirmation: "12345678",
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
    @HttpCode (201)
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiResponse ({
        status: 401,
        description: "Unauthorized",
    })
    @ApiResponse ({
        status: 403,
        description: "Unverified",
    })
    @AppApiStoreCrudSpecDecorator ({
        name: "user",
        email: "user@mail.com",
        password: "12345678",
        password_confirmation: "12345678",
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
    @HttpCode (200)
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiResponse ({
        status: 401,
        description: "Unauthorized",
    })
    @ApiResponse ({
        status: 403,
        description: "Unverified",
    })
    @AppApiDestroyCrudSpecDecorator ("id")
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
    @HttpCode (200)
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiResponse ({
        status: 401,
        description: "Unauthorized",
    })
    @ApiResponse ({
        status: 403,
        description: "Unverified",
    })
    @AppApiDestroyCrudSpecDecorator ("id")
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
    @HttpCode (200)
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
        status: 200,
        description: "Ok",
    })
    @ApiResponse ({
        status: 400,
        description: "Validation error",
    })
    @ApiResponse ({
        status: 401,
        description: "Unauthorized",
    })
    @ApiResponse ({
        status: 403,
        description: "Unverified",
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
}
