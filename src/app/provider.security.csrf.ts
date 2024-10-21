"use strict";

import { AppProvider, } from "src/app/provider";
import csrf from "@fastify/csrf-protection";

/**
 * @class
 * @extends {AppProvider}
 */
export class AppSecurityCsrfProvider extends AppProvider
{
    /**
     * @returns {Promise<void>}
     */
    public async register (): Promise<void>
    {
        await this.appService.register (csrf);
    }

    /**
     * @returns {Promise<void>}
     */
    public async boot (): Promise<void>
    {
        //
    }
};
