"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { AppHelperContract, } from "src/app/contracts/app.helper.contract";
import collectionHelper from "underscore";

@Injectable ()
/**
 * @class {CollectionHelper}
 * @implements {AppHelperContract}
 */
export class CollectionHelper implements AppHelperContract
{
    /**
     * @param {ConfigService} configService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService
    )
    {
        //
    }

    /**
     * @returns {any}
     */
    public ref (): any
    {
        return collectionHelper;
    }
};
