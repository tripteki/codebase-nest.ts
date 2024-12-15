"use strict";

import {

    Type,
    MiddlewareConfigurator,
    Kernel,
    IntentGuard,
    IntentMiddleware,
    CorsMiddleware,

} from "@intentjs/core";

import { Server, } from "@intentjs/hyper-express";

import { UserAdminController, } from "src/v1/api/user/https/controllers/user.admin.controller";

export class HttpKernel extends Kernel
{
    /**
     * @param { Server } app
     * @returns { Promise<void> }
     */
    public async boot (app: Server): Promise<void>
    {
        //
    }

    /**
     * @param { MiddlewareConfigurator } configurator
     * @returns { void }
     */
    public routeMiddlewares (configurator: MiddlewareConfigurator): void
    {
        //
    }

    /**
     * @returns { Type<IntentMiddleware>[] }
     */
    public middlewares (): Type<IntentMiddleware>[]
    {
        return [

            CorsMiddleware,
        ];
    }

    /**
     * @returns { Type<IntentGuard>[] }
     */
    public guards (): Type<IntentGuard>[]
    {
        return [

            //
        ];
    }

    /**
     * @returns { Type<any>[] }
     */
    public controllers (): Type<any>[]
    {
        return [

            UserAdminController,
        ];
    }
};
