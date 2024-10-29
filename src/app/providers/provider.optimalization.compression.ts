"use strict";

import { AppProvider, } from "src/app/providers/provider";
import * as compression from "compression";

/**
 * @class
 * @extends {AppProvider}
 */
export class AppOptimalizationCompressionProvider extends AppProvider
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
        if (this.configService.get<string> ("app.env") === "production") this.appService.use (compression ({ threshold: 0, }));
    }
};
