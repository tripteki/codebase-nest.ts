import { Resolver, Args, Query, Mutation, } from "@nestjs/graphql";
import { ConfigService, } from "@nestjs/config";
import { UserAuthService, } from "src/v1/api/user/services/user.auth.service";
import { UserAuthTransformerDto, } from "src/v1/graphql/user/dtos/user.transformer.dto";
import { UserAuthDto, } from "src/v1/graphql/user/dtos/user.validator.dto";

@Resolver (() => UserAuthTransformerDto)
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
}
