"use strict";

import { Socket, } from "socket.io";
import { Server, } from "socket.io";
import { WebSocketServer, } from "@nestjs/websockets";
import { WebSocketGateway, } from "@nestjs/websockets";
import { OnGatewayConnection, } from "@nestjs/websockets";
import { UseGuards, } from "@nestjs/common";
import { JwtService, } from "@nestjs/jwt";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { UserAuthService, } from "src/v1/api/user/services/user.auth.service";
import { UserAuthAccessTokenEnum, } from "src/v1/api/user/dtos/user.auth.enum";
import { UserWsAuthGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.guard.middleware";
import { UserWsVerificationGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.verification.guard.middleware";

@WebSocketGateway ()
@UseGuards (UserWsAuthGuardMiddleware, UserWsVerificationGuardMiddleware)
/**
 * @class {AppBroadcastNotificationListener}
 * @abstract {AppBroadcastNotificationListener}
 * @implements {OnGatewayConnection}
 */
export abstract class AppBroadcastNotificationListener implements OnGatewayConnection
{
    @WebSocketServer ()
    /**
     * @type {Server}
     */
    public serverBroadcaster: Server;

    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {UserAuthService} userAuthService
     * @param {JwtService} jwtService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly userAuthService: UserAuthService,
        protected readonly jwtService: JwtService
    )
    {
        //
    }

    /**
     * @param {string} userId
     * @returns {string}
     */
    protected userRoom (userId: string): string
    {
        return `user:${userId}`;
    }

    /**
     * @param {string} userId
     * @param {string} event
     * @param {unknown} payload
     * @returns {void}
     */
    protected emitToUser (
        userId: string,
        event: string,
        payload: unknown
    ): void
    {
        if (! userId || ! this.serverBroadcaster)
        {
            return;
        }

        this.serverBroadcaster.to (this.userRoom (userId)).emit (event, payload);
    }

    /**
     * @param {Socket} client
     * @returns {Promise<void>}
     */
    public async handleConnection (client: Socket): Promise<void>
    {
        try {

            const token: string | undefined = this.userAuthService.wsBearerToken (client);

            if (! token)
            {
                throw new Error ();
            }

            const payload = await this.jwtService.verifyAsync (token, {
                secret: this.configService.get<string> ("auth.secret"),
            });

            if (payload?.scope !== UserAuthAccessTokenEnum)
            {
                throw new Error ();
            }

            if (! await this.userAuthService.checkToken (token))
            {
                throw new Error ();
            }

            const userId: string = payload?.sub;

            if (! userId)
            {
                throw new Error ();
            }

            const user = await this.userAuthService.me ({ userId, });

            if (! user || typeof user === "string" || ! user.email_verified_at)
            {
                throw new Error ();
            }

            client["user"] = payload;
            await client.join (this.userRoom (userId));

        } catch {

            client.disconnect (true);
        }
    }
};
