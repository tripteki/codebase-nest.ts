import { Request, } from "express";
import { Controller, Get, HttpCode, Param, Req, UseGuards, } from "@nestjs/common";
import { Throttle as ThrottleMiddleware, ThrottlerGuard as ThrottleGuardMiddleware, } from "@nestjs/throttler";
import { ApiBearerAuth, ApiResponse, ApiTags, } from "@nestjs/swagger";
import { Message, Status, } from "src/app/dtos/app.dto";
import { AppApiCurrentPageQueryStringDecorator, AppApiLimitPageQueryStringDecorator, AppCurrentPageQueryStringDecorator, AppLimitPageQueryStringDecorator, } from "src/app/decorators/app.page.decorator";
import { AppApiFilterQueryStringDecorator, AppFilterQueryStringDecorator, } from "src/app/decorators/app.filter.decorator";
import { AppApiOrderQueryStringDecorator, AppOrderQueryStringDecorator, } from "src/app/decorators/app.order.decorator";
import { Filterization, OffsetPagination, Orderization, } from "src/app/repositories/app.repository";
import { ActivityTransformerDto, } from "src/v1/api/log/dtos/activity.transformer.dto";
import { ActivityAdminService, } from "src/v1/api/log/services/activity.admin.service";
import { UserAuthAccessTokenMetadataMiddleware, } from "src/v1/api/user/dtos/user.auth.enum";
import { UserHttpAuthGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.guard.middleware";
import { UserHttpVerificationGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.verification.guard.middleware";
import { UserHttpPermissionGuardMiddleware, UserPermissionMetadataMiddleware, } from "src/v1/api/user/middlewares/user.permission.guard.middleware";
import { IsString, } from "class-validator";

/**
 * @class {ActivityIdentifierDto}
 */
class ActivityIdentifierDto
{
    @IsString ()
    /**
     * @type {string}
     */
    id: string;
}

@ApiTags ("ActivityAdmin")
@Controller ("/v1/admin/activities")
/**
 * @class {ActivityAdminController}
 */
export class ActivityAdminController
{
    /**
     * @param {ActivityAdminService} activityAdminService
     * @returns {void}
     */
    constructor (
        protected readonly activityAdminService: ActivityAdminService
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
    @UserPermissionMetadataMiddleware ("activity.view")
    @AppApiOrderQueryStringDecorator ("orders")
    @AppApiFilterQueryStringDecorator ("filters")
    @AppApiLimitPageQueryStringDecorator ("limitPage")
    @AppApiCurrentPageQueryStringDecorator ("currentPage")
    @ApiBearerAuth ()
    @ApiResponse ({ status: Status.UNAUTHORIZED, description: Message.UNAUTHORIZED, })
    @ApiResponse ({ status: Status.FORBIDDEN, description: Message.UNVERIFIED, })
    /**
     * @param {Request} request
     * @param {Orderization<ActivityTransformerDto>[]} orders
     * @param {Filterization<ActivityTransformerDto>[]} filters
     * @param {number} limitPage
     * @param {number} currentPage
     * @returns {Promise<OffsetPagination<ActivityTransformerDto>>}
     */
    public async index (
        @Req () request: Request,
        @AppOrderQueryStringDecorator ("orders") orders: Orderization<ActivityTransformerDto>[],
        @AppFilterQueryStringDecorator ("filters") filters: Filterization<ActivityTransformerDto>[],
        @AppLimitPageQueryStringDecorator ("limitPage") limitPage: number,
        @AppCurrentPageQueryStringDecorator ("currentPage") currentPage: number
    ): Promise<OffsetPagination<ActivityTransformerDto>>
    {
        return this.activityAdminService.all (request["user"].sub, orders, filters, { limitPage, currentPage, });
    }

    @Get ("/:id")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("activity.view")
    @ApiBearerAuth ()
    /**
     * @param {Request} request
     * @param {ActivityIdentifierDto} parameters
     * @returns {Promise<ActivityTransformerDto>}
     */
    public async show (
        @Req () request: Request,
        @Param () parameters: ActivityIdentifierDto
    ): Promise<ActivityTransformerDto>
    {
        return this.activityAdminService.get (request["user"].sub, parameters.id);
    }
}
