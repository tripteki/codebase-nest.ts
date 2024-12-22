import { Request, Response, } from "express";
import { Controller, HttpCode, Body, Param, Get, Post, Put, Patch, Delete, Req, Res, UseGuards, } from "@nestjs/common";
import { ApiTags, ApiParam, ApiBody, ApiResponse, ApiBearerAuth, } from "@nestjs/swagger";
import { Throttle, } from "@nestjs/throttler";
import { AppApiIndexCrudSpecDecorator, AppApiDestroyCrudSpecDecorator, AppApiShowCrudSpecDecorator, AppApiStoreCrudSpecDecorator, AppApiUpdateCrudSpecDecorator, } from "src/app/decorators/app.crud.decorator";
import { ConfigService, } from "@nestjs/config";
import { UserAuthService, } from "src/v1/api/user/services/user.auth.service";
import { AuthAccessTokenMetadata, AuthRefreshTokenMetadata, } from "src/v1/api/user/dtos/auth.enum";
import { AuthTransformerDto, UserTransformerDto, } from "src/v1/api/user/dtos/user.transformer.dto";
import { UserAuthDto, UserCreateValidatorDto, } from "src/v1/api/user/dtos/user.validator.dto";
import { HttpAuthGuard, } from "src/v1/api/user/middlewares/auth.guard";

@ApiTags ("UserAuth")
@Controller ("/v1/auth")
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

    @Post ("/login")
    @HttpCode (201)
    @Throttle ({ default: { limit: 3, ttl: 60000, }, })
    @AppApiStoreCrudSpecDecorator ({
        identifierKey: "email",
        identifierValue: "user@mail.com",
        password: "12345678",
    })
    /**
     * @param {UserAuthDto} inputs
     * @returns {Promise<AuthTransformerDto | string>}
     */
    public async login (
        @Body () inputs: UserAuthDto
    ): Promise<AuthTransformerDto | string>
    {
        return await this.userAuthService.login (
            inputs
        );
    }

    @Post ("/logout")
    @HttpCode (200)
    @UseGuards (HttpAuthGuard)
    @AuthAccessTokenMetadata ()
    @ApiBearerAuth ()
    @ApiResponse ({
        status: 200,
        description: "Ok",
    })
    @ApiResponse ({
        status: 401,
        description: "Unauthorized",
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

    @Put ("/refresh")
    @HttpCode (200)
    @Throttle ({ default: { limit: 3, ttl: 60000, }, })
    @UseGuards (HttpAuthGuard)
    @AuthRefreshTokenMetadata ()
    @ApiBearerAuth ()
    @ApiResponse ({
        status: 200,
        description: "Ok",
    })
    @ApiResponse ({
        status: 401,
        description: "Unauthorized",
    })
    /**
     * @param {Request} request
     * @param {Response} response
     * @returns {Promise<AuthTransformerDto | string>}
     */
    public async refresh (
        @Req () request: Request
    ): Promise<AuthTransformerDto | string>
    {
        return await this.userAuthService.refresh (
            { userId: request["user"].sub, },
            this.userAuthService.httpBearerToken (request)
        );
    }

    @Get ("/me")
    @HttpCode (200)
    @UseGuards (HttpAuthGuard)
    @AuthAccessTokenMetadata ()
    @ApiBearerAuth ()
    @ApiResponse ({
        status: 200,
        description: "Ok",
    })
    @ApiResponse ({
        status: 401,
        description: "Unauthorized",
    })
    /**
     * @param {Request} request
     * @param {Response} response
     * @returns {Promise<Promise<UserTransformerDto | string>>}
     */
    public async me (
        @Req () request: Request
    ): Promise<Promise<UserTransformerDto | string>>
    {
        return await this.userAuthService.me ({ userId: request["user"].sub, });
    }

    @Post ("/register")
    @HttpCode (201)
    @AppApiStoreCrudSpecDecorator ({
        name: "user",
        email: "user@mail.com",
        password: "12345678",
        password_confirmation: "12345678",
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
}
