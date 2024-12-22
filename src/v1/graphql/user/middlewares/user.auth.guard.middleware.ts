import { GqlExecutionContext, } from "@nestjs/graphql";
import { Reflector, } from "@nestjs/core";
import { Injectable, Inject, ExecutionContext, CanActivate, UnauthorizedException, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { JwtService, } from "@nestjs/jwt";
import { UserAuthService, } from "src/v1/graphql/user/services/user.auth.service";
import { UserAuthAccessTokenEnum, UserAuthRefreshTokenEnum, } from "src/v1/api/user/dtos/user.auth.enum";

@Injectable ()
/**
 * @class {UserGraphqlAuthGuardMiddleware}
 * @implements {CanActivate}
 */
export class UserGraphqlAuthGuardMiddleware implements CanActivate
{
    /**
     * @param {Reflector} reflector
     * @param {ConfigService} configService
     * @param {JwtService} jwtService
     * @param {UserAuthService} userAuthService
     * @returns {void}
     */
    constructor (
        protected readonly reflector: Reflector,
        protected readonly configService: ConfigService,
        protected readonly jwtService: JwtService,
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
        token: string | undefined = this.userAuthService.graphqlBearerToken (request),
        isAccessToken: boolean = this.reflector.getAllAndOverride<boolean> (UserAuthAccessTokenEnum, [
            context.getHandler (),
            context.getClass (),
        ]),
        isRefreshToken: boolean = this.reflector.getAllAndOverride<boolean> (UserAuthRefreshTokenEnum, [
            context.getHandler (),
            context.getClass (),
        ]);

        try {

            if (! token) throw new Error ();

            request["user"] = await this.jwtService.verifyAsync (token, {
                secret: this.configService.get<string> ("auth.secret"),
            });

            if (isAccessToken && request["user"].scope !== UserAuthAccessTokenEnum) throw new Error ();
            if (isRefreshToken && request["user"].scope !== UserAuthRefreshTokenEnum) throw new Error ();

            if (! await this.userAuthService.checkToken (token)) throw new Error ();

        } catch {

            throw new UnauthorizedException ("Not Authorized");
        }

        return true;
    }
}
