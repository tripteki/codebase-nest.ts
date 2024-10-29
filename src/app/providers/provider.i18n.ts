"use strict";

import { AppProvider, } from "src/app/providers/provider";
import { I18nValidationPipe, I18nValidationExceptionFilter, } from "nestjs-i18n";

/**
 * @class
 * @extends {AppProvider}
 */
export class AppI18nProvider extends AppProvider
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
        this.appService.useGlobalPipes (new I18nValidationPipe ());
        this.appService.useGlobalFilters (new I18nValidationExceptionFilter ());
    }
};
