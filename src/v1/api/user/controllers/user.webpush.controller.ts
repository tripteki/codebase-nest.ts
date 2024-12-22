import { Request, } from "express";
import { Controller, HttpCode, Body, Post, Req, UseGuards, } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiBody, ApiResponse, } from "@nestjs/swagger";
import { Status, Message, } from "src/app/dtos/app.dto";
import { AppApiStandardResponsesDecorator, } from "src/app/decorators/app.swagger.decorator";
import { UserHttpAuthGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.guard.middleware";
import { UserHttpVerificationGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.verification.guard.middleware";
import { UserAuthAccessTokenMetadataMiddleware, } from "src/v1/api/user/dtos/user.auth.enum";
import { UserWebpushService, } from "src/v1/api/user/services/user.webpush.service";
import {
    UserWebpushSubscribeValidatorDto,
    UserWebpushUnsubscribeValidatorDto,
    UserWebpushSuccessTransformerDto,
} from "src/v1/api/user/dtos/user.webpush.validator.dto";

@ApiTags ("UserWebpush")
@Controller ()
export class UserWebpushController
{
    /**
     * @param {UserWebpushService} userWebpushService
     * @returns {void}
     */
    constructor (
        protected readonly userWebpushService: UserWebpushService
    )
    {
        //
    }

    @Post ("/v1/webpush/subscribe")
    @HttpCode (Status.OK)
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiBody ({ type: UserWebpushSubscribeValidatorDto, })
    @ApiResponse ({
        status: Status.OK,
        type: UserWebpushSuccessTransformerDto,
    })
    @AppApiStandardResponsesDecorator ({ unauthorized: true, forbidden: true, unvalidated: true, })
    /**
     * @param {Request} request
     * @param {UserWebpushSubscribeValidatorDto} inputs
     * @returns {Promise<UserWebpushSuccessTransformerDto>}
     */
    public async subscribe (
        @Req () request: Request,
        @Body () inputs: UserWebpushSubscribeValidatorDto
    ): Promise<UserWebpushSuccessTransformerDto>
    {
        return await this.userWebpushService.subscribe (request["user"].sub, inputs);
    }

    @Post ("/v1/webpush/unsubscribe")
    @HttpCode (Status.OK)
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiBody ({ type: UserWebpushUnsubscribeValidatorDto, })
    @ApiResponse ({
        status: Status.OK,
        type: UserWebpushSuccessTransformerDto,
    })
    @AppApiStandardResponsesDecorator ({ unauthorized: true, forbidden: true, unvalidated: true, })
    /**
     * @param {Request} request
     * @param {UserWebpushUnsubscribeValidatorDto} inputs
     * @returns {Promise<UserWebpushSuccessTransformerDto>}
     */
    public async unsubscribe (
        @Req () request: Request,
        @Body () inputs: UserWebpushUnsubscribeValidatorDto
    ): Promise<UserWebpushSuccessTransformerDto>
    {
        return await this.userWebpushService.unsubscribe (request["user"].sub, inputs);
    }
}
