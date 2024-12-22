import { Request, Response, } from "express";
import { Socket, } from "socket.io";
import { Reflector, } from "@nestjs/core";
import { Injectable, Inject, ExecutionContext, CanActivate, UnauthorizedException, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { JwtService, } from "@nestjs/jwt";
import { UserAuthService, } from "src/v1/api/user/services/user.auth.service";
import { UserAuthAccessTokenEnum, UserAuthRefreshTokenEnum, } from "src/v1/api/user/dtos/user.auth.enum";

@Injectable ()
/**
 * @class {UserHttpAuthGuardMiddleware}
 * @implements {CanActivate}
 */
export class UserHttpAuthGuardMiddleware implements CanActivate
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

        request: Request = context.switchToHttp ().getRequest (),
        response: Response = context.switchToHttp ().getResponse (),
        token: string | undefined = this.userAuthService.httpBearerToken (request),
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

@Injectable ()
/**
 * @class {UserWsAuthGuardMiddleware}
 * @implements {CanActivate}
 */
export class UserWsAuthGuardMiddleware implements CanActivate
{
    /**
     * @param {ConfigService} configService
     * @param {JwtService} jwtService
     * @param {UserAuthService} userAuthService
     * @returns {void}
     */
    constructor (
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

        ws: Socket = context.switchToWs ().getClient (),
        token: string | undefined = this.userAuthService.wsBearerToken (ws);

        try {

            if (! token) throw new Error ();

            ws["user"] = await this.jwtService.verifyAsync (token, {
                secret: this.configService.get<string> ("auth.secret"),
            });

        } catch {

            throw new UnauthorizedException ("Not Authorized");
        }

        return true;
    }
}
