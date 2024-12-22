"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { HelperContract, } from "src/app/contracts/helper.contract";
import collectionHelper from "underscore";

@Injectable ()
/**
 * @class {CollectionHelper}
 * @implements {HelperContract}
 */
export class CollectionHelper implements HelperContract
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
        return collectionHelper;
    }
};
