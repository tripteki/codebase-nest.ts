import { Request, Response, } from "express";
import { Controller, HttpCode, Body, Param, Get, Post, Put, Patch, Delete, Req, Res, UseGuards, } from "@nestjs/common";
import { ApiTags, ApiParam, ApiBody, ApiResponse, ApiBearerAuth, } from "@nestjs/swagger";
import { BatchPayloadType, } from "src/app/dtos/app.dto";
import { OffsetPaginationType, CursorPaginationType, OffsetPagination, CursorPagination, Orderization, Filterization, } from "src/app/repositories/app.repository";
import { AppApiOrderQueryStringDecorator, AppOrderQueryStringDecorator, } from "src/app/decorators/app.order.decorator";
import { AppApiFilterQueryStringDecorator, AppFilterQueryStringDecorator, } from "src/app/decorators/app.filter.decorator";
import { AppApiCurrentPageQueryStringDecorator, AppApiLimitPageQueryStringDecorator, AppLimitPageQueryStringDecorator, AppCurrentPageQueryStringDecorator, } from "src/app/decorators/app.page.decorator";
import { AppApiIndexCrudSpecDecorator, AppApiDestroyCrudSpecDecorator, AppApiShowCrudSpecDecorator, AppApiStoreCrudSpecDecorator, AppApiUpdateCrudSpecDecorator, } from "src/app/decorators/app.crud.decorator";
import { ConfigService, } from "@nestjs/config";
import { NotificationUserService, } from "src/v1/api/notification/services/notification.user.service";
import { NotificationTransformerDto, } from "src/v1/api/notification/dtos/notification.transformer.dto";
import { NotificationIdentifierDto, } from "src/v1/api/notification/dtos/notification.validator.dto";
import { UserAuthAccessTokenMetadataMiddleware, UserAuthRefreshTokenMetadataMiddleware, } from "src/v1/api/user/dtos/user.auth.enum";
import { UserHttpAuthGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.guard.middleware";
import { UserHttpVerificationGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.verification.guard.middleware";

@ApiTags ("NotificationUser")
@Controller ("/v1/notifications")
export class NotificationUserController
{
    /**
     * @param {ConfigService} configService
     * @param {NotificationUserService} notificationUserService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly notificationUserService: NotificationUserService
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
     * @param {Orderization<NotificationTransformerDto>[]} orders
     * @param {Filterization<NotificationTransformerDto>[]} filters
     * @param {number} limitPage
     * @param {number} currentPage
     * @returns {Promise<NotificationTransformerDto[]>}
     */
    public async index (
        @Req () request: Request,
        @AppOrderQueryStringDecorator ("orders") orders: Orderization<NotificationTransformerDto>[],
        @AppFilterQueryStringDecorator ("filters") filters: Filterization<NotificationTransformerDto>[],
        @AppLimitPageQueryStringDecorator ("limitPage") limitPage: number,
        @AppCurrentPageQueryStringDecorator ("currentPage") currentPage: number
    ): Promise<OffsetPagination<NotificationTransformerDto>>
    {
        return await this.notificationUserService.all (
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
     * @param {NotificationIdentifierDto} parameters
     * @returns {Promise<NotificationTransformerDto | string>}
     */
    public async show (
        @Req () request: Request,
        @Param () parameters: NotificationIdentifierDto
    ): Promise<NotificationTransformerDto | string>
    {
        return await this.notificationUserService.get (
            { userId: request["user"].sub, },
            parameters
        );
    }

    @Put ("/read-all")
    @HttpCode (200)
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
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
     * @returns {Promise<BatchPayloadType>}
     */
    public async readAll (
        @Req () request: Request
    ): Promise<BatchPayloadType>
    {
        return await this.notificationUserService.readAll (
            { userId: request["user"].sub, }
        );
    }

    @Put ("/read/:id")
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
     * @param {NotificationIdentifierDto} parameters
     * @returns {Promise<NotificationTransformerDto | string>}
     */
    public async read (
        @Req () request: Request,
        @Param () parameters: NotificationIdentifierDto
    ): Promise<NotificationTransformerDto | string>
    {
        return await this.notificationUserService.read (
            { userId: request["user"].sub, },
            parameters
        );
    }

    @Delete ("/:id")
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
     * @param {NotificationIdentifierDto} parameters
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async destroy (
        @Req () request: Request,
        @Param () parameters: NotificationIdentifierDto
    ): Promise<NotificationTransformerDto | string>
    {
        return await this.notificationUserService.delete (
            { userId: request["user"].sub, },
            parameters
        );
    }
}
