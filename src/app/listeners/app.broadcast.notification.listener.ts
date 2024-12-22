"use strict";

import { Server, } from "socket.io";
import { WebSocketServer, } from "@nestjs/websockets";
import { WebSocketGateway, } from "@nestjs/websockets";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";

@WebSocketGateway ()
/**
 * @class {AppBroadcastNotificationListener}
 * @abstract {AppBroadcastNotificationListener}
 */
export abstract class AppBroadcastNotificationListener
{
    @WebSocketServer ()
    /**
     * @type {Server}
     */
    public serverBroadcaster: Server;

    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService
    )
    {
        //
    }
};
