"use strict";

import { AppProvider, } from "src/app/provider";
import helmet from "helmet";

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
        //
    }

    /**
     * @returns {Promise<void>}
     */
    public async boot (): Promise<void>
    {
        this.appService.use (helmet ());
    }
};
