"use strict";

import { AppProvider, } from "src/app/provider";
import { CorsOptions, } from "@nestjs/common/interfaces/external/cors-options.interface";

/**
 * @class
 * @extends {AppProvider}
 */
export class AppSecurityCorsProvider extends AppProvider
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
        this.appService.enableCors (this.configService.get<CorsOptions> ("app.cors"));
    }
};
