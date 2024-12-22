import { Request, Response, } from "express";
import { Socket, } from "socket.io";
import { Injectable, ExecutionContext, CanActivate, ForbiddenException, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { UserAuthService, } from "src/v1/api/user/services/user.auth.service";
import { UserTransformerDto, } from "src/v1/api/user/dtos/user.transformer.dto";

@Injectable ()
/**
 * @class {UserHttpVerificationGuardMiddleware}
 * @implements {CanActivate}
 */
export class UserHttpVerificationGuardMiddleware implements CanActivate
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

        request: Request = context.switchToHttp ().getRequest (),
        response: Response = context.switchToHttp ().getResponse (),
        user: UserTransformerDto = await this.userAuthService.me ({ userId: request["user"].sub, }) as UserTransformerDto;

        try {

            if (! user.email_verified_at) throw new Error ();

        } catch {

            throw new ForbiddenException ("Not Verified");
        }

        return true;
    }
}

@Injectable ()
/**
 * @class {UserWsVerificationGuardMiddleware}
 * @implements {CanActivate}
 */
export class UserWsVerificationGuardMiddleware implements CanActivate
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

        ws: Socket = context.switchToWs ().getClient (),
        user: UserTransformerDto = await this.userAuthService.me ({ userId: ws["user"].sub, }) as UserTransformerDto;

        try {

            if (! user.email_verified_at) throw new Error ();

        } catch {

            throw new ForbiddenException ("Not Verified");
        }

        return true;
    }
}
