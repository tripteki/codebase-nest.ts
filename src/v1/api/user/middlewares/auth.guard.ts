import { Request, Response, } from "express";
import { Socket, } from "socket.io";
import { Reflector, } from "@nestjs/core";
import { Injectable, Inject, ExecutionContext, CanActivate, UnauthorizedException, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { JwtService, } from "@nestjs/jwt";
import { UserAuthService, } from "src/v1/api/user/services/user.auth.service";
import { AuthAccessTokenEnum, AuthRefreshTokenEnum, } from "src/v1/api/user/dtos/auth.enum";

@Injectable ()
/**
 * @class {HttpAuthGuard}
 * @implements {CanActivate}
 */
export class HttpAuthGuard implements CanActivate
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
        isAccessToken: boolean = this.reflector.getAllAndOverride<boolean> (AuthAccessTokenEnum, [
            context.getHandler (),
            context.getClass (),
        ]),
        isRefreshToken: boolean = this.reflector.getAllAndOverride<boolean> (AuthRefreshTokenEnum, [
            context.getHandler (),
            context.getClass (),
        ]);

        try {

            if (! token) throw new Error ();

            request["user"] = await this.jwtService.verifyAsync (token, {
                secret: this.configService.get<string> ("auth.secret"),
            });

            if (isAccessToken && request["user"].scope !== AuthAccessTokenEnum) throw new Error ();
            if (isRefreshToken && request["user"].scope !== AuthRefreshTokenEnum) throw new Error ();

            if (! await this.userAuthService.checkToken (token)) throw new Error ();

        } catch {

            throw new UnauthorizedException ();
        }

        return true;
    }
}

@Injectable ()
/**
 * @class {WsAuthGuard}
 * @implements {CanActivate}
 */
export class WsAuthGuard implements CanActivate
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

            throw new UnauthorizedException ();
        }

        return true;
    }
}
