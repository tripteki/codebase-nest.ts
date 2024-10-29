"use strict";

import { Logger as LogService, } from "@nestjs/common";

/**
 * @abstract
 * @class
 */
export abstract class CommonRepository
{
    /**
     * @param {LogService} logService
     * @returns {void}
     */
    constructor (
        protected readonly logService: LogService
    )
    {
        //
    }
};
