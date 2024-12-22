"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { AppHelperContract, } from "src/app/contracts/app.helper.contract";

@Injectable ()
/**
 * @class {FakerHelper}
 * @implements {AppHelperContract}
 */
export class FakerHelper implements AppHelperContract
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
        let locale: string = this.configService.get<string> ("app.fakerLocale") ||
                             this.configService.get<string> ("app.locale") ||
                             this.configService.get<string> ("app.fallbackLocale"),
            driver = (language: string): any => require (`@faker-js/faker/locale/${language}`);

        try {

            return driver (locale).faker;

        } catch (thrower: any) {

            return driver ("en").faker;
        }
    }
};
