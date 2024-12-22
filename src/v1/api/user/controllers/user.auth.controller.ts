import { Request, Response, } from "express";
import { Controller, HttpCode, Body, Param, Query, Get, Post, Put, Patch, Delete, Req, Res, UseGuards, } from "@nestjs/common";
import { ApiTags, ApiParam, ApiQuery, ApiBody, ApiResponse, ApiBearerAuth, } from "@nestjs/swagger";
import { Throttle as ThrottleMiddleware, ThrottlerGuard as ThrottleGuardMiddleware, } from "@nestjs/throttler";
import { ConfigService, } from "@nestjs/config";
import { Status, Message, } from "src/app/dtos/app.dto";
import { AppUrlGuardMiddleware, } from "src/app/middlewares/app.url.guard.middleware";
import { UserAuthService, } from "src/v1/api/user/services/user.auth.service";
import { UserAuthTransformerDto, UserTransformerDto, } from "src/v1/api/user/dtos/user.transformer.dto";
import { UserAuthDto, UserIdentifierEmailDto, UserCreateValidatorDto, UserResetterUpdateValidatorDto, } from "src/v1/api/user/dtos/user.validator.dto";
import { UserAuthAccessTokenMetadataMiddleware, UserAuthRefreshTokenMetadataMiddleware, } from "src/v1/api/user/dtos/user.auth.enum";
import { UserHttpAuthGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.guard.middleware";

@ApiTags ("UserAuth")
@Controller ()
export class UserAuthController
{
    /**
     * @param {ConfigService} configService
     * @param {UserAuthService} userAuthService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly userAuthService: UserAuthService
    )
    {
        //
    }

    @Post ("/v1/auth/login")
    @HttpCode (Status.CREATED)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 3, ttl: 60000, }, })
    @ApiBody ({
        required: true,
        description: "The input",
        examples: { "application/json": { value: {
            identifierKey: "email",
            identifierValue: "user@mail.com",
            password: "12345678",
        }, }, },
    })
    @ApiResponse ({
        status: Status.CREATED,
        description: Message.CREATED,
    })
    @ApiResponse ({
        status: Status.BAD_REQUEST,
        description: Message.UNVALIDATED,
    })
    /**
     * @param {UserAuthDto} inputs
     * @returns {Promise<UserAuthTransformerDto | string>}
     */
    public async login (
        @Body () inputs: UserAuthDto
    ): Promise<UserAuthTransformerDto | string>
    {
        return await this.userAuthService.login (
            inputs
        );
    }

    @Post ("/v1/auth/logout")
    @HttpCode (Status.OK)
    @UseGuards (UserHttpAuthGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiResponse ({
        status: Status.OK,
        description: Message.OK,
    })
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    /**
     * @param {Request} request
     * @param {Response} response
     * @returns {Promise<boolean>}
     */
    public async logout (
        @Req () request: Request
    ): Promise<boolean>
    {
        return Boolean (
            this.userAuthService.logout (
                { userId: request["user"].sub, },
                this.userAuthService.httpBearerToken (request)
            )
        );
    }

    @Put ("/v1/auth/refresh")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @UseGuards (UserHttpAuthGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 3, ttl: 60000, }, })
    @UserAuthRefreshTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiResponse ({
        status: Status.OK,
        description: Message.OK,
    })
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    /**
     * @param {Request} request
     * @param {Response} response
     * @returns {Promise<UserAuthTransformerDto | string>}
     */
    public async refresh (
        @Req () request: Request
    ): Promise<UserAuthTransformerDto | string>
    {
        return await this.userAuthService.refresh (
            { userId: request["user"].sub, },
            this.userAuthService.httpBearerToken (request)
        );
    }

    @Get ("/v1/auth/me")
    @HttpCode (Status.OK)
    @UseGuards (UserHttpAuthGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiResponse ({
        status: Status.OK,
        description: Message.OK,
    })
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    /**
     * @param {Request} request
     * @param {Response} response
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async me (
        @Req () request: Request
    ): Promise<UserTransformerDto | string>
    {
        return await this.userAuthService.me ({ userId: request["user"].sub, });
    }

    @Post ("/v1/auth/register")
    @HttpCode (Status.CREATED)
    @ApiBody ({
        required: true,
        description: "The input",
        examples: { "application/json": { value: {
            name: "user",
            email: "user@mail.com",
            password: "12345678",
            password_confirmation: "12345678",
        }, }, },
    })
    @ApiResponse ({
        status: Status.CREATED,
        description: Message.CREATED,
    })
    @ApiResponse ({
        status: Status.BAD_REQUEST,
        description: Message.UNVALIDATED,
    })
    /**
     * @param {UserCreateValidatorDto} inputs
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async register (
        @Body () inputs: UserCreateValidatorDto
    ): Promise<UserTransformerDto | string>
    {
        return await this.userAuthService.register (
            inputs
        );
    }

    @Post ("/auth/verify-email/:email")
    @HttpCode (Status.OK)
    @UseGuards (AppUrlGuardMiddleware)
    @ApiQuery ({
        name: "signed",
        required: true,
        type: String,
        description: "The signed",
    })
    @ApiParam ({
        name: "email",
        required: true,
        type: String,
        description: "The email identifier",
    })
    @ApiResponse ({
        status: Status.OK,
        description: Message.OK,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNSIGNED,
    })
    /**
     * @param {Request} request
     * @param {Response} response
     * @param {UserIdentifierEmailDto} parameters
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async verify (
        @Req () request: Request,
        @Param () parameters: UserIdentifierEmailDto
    ): Promise<UserTransformerDto | string>
    {
        return await this.userAuthService.verify ({ userEmail: parameters.email, });
    }

    @Post ("/v1/auth/email/verification-notification")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @UseGuards (UserHttpAuthGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 3, ttl: 60000, }, })
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiResponse ({
        status: Status.OK,
        description: Message.OK,
    })
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    /**
     * @param {Request} request
     * @param {Response} response
     * @returns {Promise<string>}
     */
    public async reverify (
        @Req () request: Request
    ): Promise<string>
    {
        return await this.userAuthService.reverify ({ userId: request["user"].sub, });
    }

    @Post ("/auth/reset-password/:email")
    @HttpCode (Status.OK)
    @UseGuards (AppUrlGuardMiddleware)
    @ApiQuery ({
        name: "signed",
        required: true,
        type: String,
        description: "The signed",
    })
    @ApiParam ({
        name: "email",
        required: true,
        type: String,
        description: "The email identifier",
    })
    @ApiBody ({
        required: true,
        description: "The input",
        examples: { "application/json": { value: {
            password: "12345678",
            password_confirmation: "12345678",
        }, }, },
    })
    @ApiResponse ({
        status: Status.OK,
        description: Message.OK,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNSIGNED,
    })
    /**
     * @param {Request} request
     * @param {Response} response
     * @param {UserIdentifierEmailDto} parameters
     * @param {UserResetterUpdateValidatorDto} inputs
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async reset (
        @Query ("signed") signed: string,
        @Param () parameters: UserIdentifierEmailDto,
        @Body () inputs: UserResetterUpdateValidatorDto
    ): Promise<UserTransformerDto | string>
    {
        return await this.userAuthService.reset ({ token: signed, email: parameters.email, password: inputs.password, password_confirmation: inputs.password_confirmation, });
    }

    @Post ("/v1/auth/forgot-password")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 3, ttl: 60000, }, })
    @ApiBody ({
        required: true,
        description: "The input",
        examples: { "application/json": { value: {
            email: "user@mail.com",
        }, }, },
    })
    @ApiResponse ({
        status: Status.OK,
        description: Message.OK,
    })
    @ApiResponse ({
        status: Status.BAD_REQUEST,
        description: Message.UNVALIDATED,
    })
    /**
     * @param {UserIdentifierEmailDto} inputs
     * @returns {Promise<string>}
     */
    public async forget (
        @Body () inputs: UserIdentifierEmailDto
    ): Promise<string>
    {
        return await this.userAuthService.forget ({ userEmail: inputs.email, });
    }
}
