"use strict";

import { AppProvider, } from "src/app/providers/provider";
import { VersioningType, ValidationPipe, } from "@nestjs/common";
import { useContainer, } from "class-validator";
import { AppModule, } from "src/app/modules/module";

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
        this.provideValidation ();
    }

    /**
     * @returns {void}
     */
    protected provideRoute (): void
    {
        this.appService.setGlobalPrefix ("api");
        this.appService.enableVersioning ();
    }

    /**
     * @returns {void}
     */
    protected provideValidation (): void
    {
        useContainer (this.appService.select (AppModule), { fallbackOnErrors: true, });
        this.appService.useGlobalPipes (new ValidationPipe ({ transform: true, }));
    }
};
