"use strict";

import { AppProvider, } from "src/app/provider";
import helmet from "@fastify/helmet";

/**
 * @class
 * @extends {AppProvider}
 */
export class AppSecurityHelmetProvider extends AppProvider
{
    /**
     * @returns {Promise<void>}
     */
    public async register (): Promise<void>
    {
        await this.appService.register (helmet);
    }

    /**
     * @returns {Promise<void>}
     */
    public async boot (): Promise<void>
    {
        //
    }
};
