"use strict";

import { AppProvider, } from "src/app/providers/provider";
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
        if (this.configService.get<string> ("app.env") === "production") this.appService.enableCors (this.configService.get<CorsOptions> ("app.cors"));
    }
};
