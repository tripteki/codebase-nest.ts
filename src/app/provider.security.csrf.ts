"use strict";

import { AppProvider, } from "src/app/provider";
import { doubleCsrf, } from "csrf-csrf";

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
        //
    }

    /**
     * @returns {Promise<void>}
     */
    public async boot (): Promise<void>
    {
        const {

            generateToken,
            validateRequest,
            doubleCsrfProtection,
            invalidCsrfTokenError,

        } = doubleCsrf (
        {
            getSecret: null,
        });

        this.appService.use (doubleCsrfProtection);
    }
};
