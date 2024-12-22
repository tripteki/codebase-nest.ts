"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { AppHelperContract, } from "src/app/contracts/app.helper.contract";
import url from "signed";

@Injectable ()
/**
 * @class {UrlHelper}
 * @implements {AppHelperContract}
 */
export class UrlHelper implements AppHelperContract
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
        let secret: string = this.configService.get<string> ("app.secret");

        return url (
        {
            secret,
        });
    }
};
