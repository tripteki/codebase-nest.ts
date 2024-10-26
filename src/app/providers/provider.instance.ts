"use strict";

import { AppProvider, } from "src/app/providers/provider";
import { VersioningType, } from "@nestjs/common";

/**
 * @class
 * @extends {AppProvider}
 */
export class AppInstanceProvider extends AppProvider
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
        this.provideRoute ();
    }

    /**
     * @returns {void}
     */
    protected provideRoute (): void
    {
        this.appService.setGlobalPrefix ("api");
        this.appService.enableVersioning ({ type: VersioningType.URI, });
    }
};
