import { Request, } from "express";
import { Controller, Get, HttpCode, Query, Req, UseGuards, } from "@nestjs/common";
import { Throttle as ThrottleMiddleware, ThrottlerGuard as ThrottleGuardMiddleware, } from "@nestjs/throttler";
import { ApiBearerAuth, ApiQuery, ApiTags, } from "@nestjs/swagger";
import { Status, } from "src/app/dtos/app.dto";
import { SearchAdminService, } from "src/v1/api/search/services/search.admin.service";
import { SearchTransformerDto, } from "src/v1/api/search/dtos/search.transformer.dto";
import { UserAuthAccessTokenMetadataMiddleware, } from "src/v1/api/user/dtos/user.auth.enum";
import { UserHttpAuthGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.guard.middleware";
import { UserHttpVerificationGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.verification.guard.middleware";

@ApiTags ("SearchAdmin")
@Controller ("/v1/admin/search")
/**
 * @class {SearchAdminController}
 */
export class SearchAdminController
{
    /**
     * @param {SearchAdminService} searchAdminService
     * @returns {void}
     */
    constructor (
        protected readonly searchAdminService: SearchAdminService
    )
    {
        //
    }

    @Get ("/")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 60, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiQuery ({ name: "q", required: false, })
    @ApiQuery ({ name: "category", required: false, })
    /**
     * @param {Request} request
     * @param {string} query
     * @param {string} category
     * @returns {Promise<SearchTransformerDto>}
     */
    public async index (
        @Req () request: Request,
        @Query ("q") query: string,
        @Query ("category") category: string
    ): Promise<SearchTransformerDto>
    {
        return this.searchAdminService.search (request["user"].sub, query, category);
    }
}
