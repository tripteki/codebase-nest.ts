import { Resolver, Context, Args, Query, Mutation, } from "@nestjs/graphql";
import { UseGuards, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { UserAuthService, } from "src/v1/graphql/user/services/user.auth.service";
import { UserAuthTransformerDto, } from "src/v1/graphql/user/dtos/user.transformer.dto";
import { UserTransformerDto, } from "src/v1/graphql/user/dtos/user.transformer.dto";
import { UserAuthDto, } from "src/v1/graphql/user/dtos/user.validator.dto";
import { UserAuthAccessTokenMetadataMiddleware, } from "src/v1/api/user/dtos/user.auth.enum";
import { UserGraphqlAuthGuardMiddleware, } from "src/v1/graphql/user/middlewares/user.auth.guard.middleware";
import { UserGraphqlVerificationGuardMiddleware, } from "src/v1/graphql/user/middlewares/user.auth.verification.guard.middleware";

@Resolver ()
/**
 * @class {UserAuthResolver}
 */
export class UserAuthResolver
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

    @Mutation (() => UserAuthTransformerDto)
    /**
     * @param {UserAuthDto} inputs
     * @returns {Promise<UserAuthTransformerDto | string>}
     */
    public async login (
        @Args ("inputs") inputs: UserAuthDto
    ): Promise<UserAuthTransformerDto | string>
    {
        return await this.userAuthService.login (
            inputs
        );
    }

    @Mutation (() => Boolean)
    @UseGuards (UserGraphqlAuthGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    /**
     * @param {any} context
     * @returns {Promise<boolean>}
     */
    public async logout (
        @Context () context: any
    ): Promise<boolean>
    {
        return Boolean (
            this.userAuthService.logout (
                { userId: context.req["user"].sub, },
                this.userAuthService.graphqlBearerToken (context.req)
            )
        );
    }

    @Query (() => UserTransformerDto)
    @UseGuards (UserGraphqlAuthGuardMiddleware, UserGraphqlVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    /**
     * @param {any} context
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async me (
        @Context () context: any
    ): Promise<UserTransformerDto | string>
    {
        return await this.userAuthService.me ({ userId: context.req["user"].sub, });
    }
}
