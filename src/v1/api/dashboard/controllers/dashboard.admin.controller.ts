import { Request, } from "express";
import { Controller, Get, HttpCode, Query, Req, UseGuards, } from "@nestjs/common";
import { Throttle as ThrottleMiddleware, ThrottlerGuard as ThrottleGuardMiddleware, } from "@nestjs/throttler";
import { ApiBearerAuth, ApiQuery, ApiTags, } from "@nestjs/swagger";
import { Status, } from "src/app/dtos/app.dto";
import { DashboardAdminService, } from "src/v1/api/dashboard/services/dashboard.admin.service";
import { DashboardTransformerDto, } from "src/v1/api/dashboard/dtos/dashboard.transformer.dto";
import { UserAuthAccessTokenMetadataMiddleware, } from "src/v1/api/user/dtos/user.auth.enum";
import { UserHttpAuthGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.guard.middleware";
import { UserHttpVerificationGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.verification.guard.middleware";

@ApiTags ("DashboardAdmin")
@Controller ("/v1/admin/dashboard")
/**
 * @class {DashboardAdminController}
 */
export class DashboardAdminController
{
    /**
     * @param {DashboardAdminService} dashboardAdminService
     * @returns {void}
     */
    constructor (
        protected readonly dashboardAdminService: DashboardAdminService
    )
    {
        //
    }

    @Get ("/")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 30, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiQuery ({ name: "period", required: false, })
    @ApiQuery ({ name: "date_from", required: false, })
    @ApiQuery ({ name: "date_to", required: false, })
    /**
     * @param {Request} request
     * @param {string} period
     * @param {string} dateFrom
     * @param {string} dateTo
     * @returns {Promise<DashboardTransformerDto>}
     */
    public async show (
        @Req () request: Request,
        @Query ("period") period: string,
        @Query ("date_from") dateFrom: string,
        @Query ("date_to") dateTo: string
    ): Promise<DashboardTransformerDto>
    {
        return this.dashboardAdminService.get (request["user"].sub, period, dateFrom, dateTo);
    }
}
