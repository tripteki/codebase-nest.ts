import { GqlExecutionContext, } from "@nestjs/graphql";
import { Injectable, ExecutionContext, CanActivate, ForbiddenException, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { UserAuthService, } from "src/v1/graphql/user/services/user.auth.service";
import { UserTransformerDto, } from "src/v1/api/user/dtos/user.transformer.dto";

@Injectable ()
/**
 * @class {UserGraphqlVerificationGuardMiddleware}
 * @implements {CanActivate}
 */
export class UserGraphqlVerificationGuardMiddleware implements CanActivate
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

    /**
     * @param {ExecutionContext} context
     * @returns {Promise<boolean>}
     */
    public async canActivate (context: ExecutionContext): Promise<boolean>
    {
        const

        ctx: any = GqlExecutionContext.create (context).getContext (),
        request: any = ctx.req,
        response: any = ctx.res,
        user: UserTransformerDto = await this.userAuthService.me ({ userId: request["user"].sub, }) as UserTransformerDto;

        try {

            if (! user.email_verified_at) throw new Error ();

        } catch {

            throw new ForbiddenException ("Not Verified");
        }

        return true;
    }
}
