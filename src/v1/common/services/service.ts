"use strict";

import { I18nService, I18nContext, } from "nestjs-i18n";

/**
 * @abstract
 * @class
 */
export abstract class CommonService
{
    /**
     * @type {string}
     */
    public readonly context: string;

    /**
     * @type {string}
     */
    public static readonly tag: string;

    /**
     * @type {string}
     */
    public static readonly sorts: string[];

    /**
     * @type {string}
     */
    public static readonly filters: string[];

    /**
     * @param {I18nService} i18nService
     * @returns {void}
     */
    constructor (
        protected readonly i18nService: I18nService
    )
    {
        //
    }

    /**
     * @param {string} resource
     * @returns {string}
     */
    public message (resource: string): string
    {
        return this.i18nService.t (

            `resource.${resource}`, {
            args: { context: this.context, },
        });
    }
};
