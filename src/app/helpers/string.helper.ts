"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { HelperContract, } from "src/app/contracts/helper.contract";
import stringHelper from "@vicgutt/strjs";

@Injectable ()
/**
 * @class {StringHelper}
 * @implements {HelperContract}
 */
export class StringHelper implements HelperContract
{
    /**
     * @param {ConfigService} configService
     * @returns {void}
     */
    constructor (
        private readonly configService: ConfigService
    )
    {
        //
    }

    /**
     * @returns {any}
     */
    public ref (): any
    {
        return stringHelper;
    }
};
