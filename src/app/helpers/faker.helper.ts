"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { HelperContract, } from "src/app/contracts/helper.contract";

@Injectable ()
/**
 * @class {FakerHelper}
 * @implements {HelperContract}
 */
export class FakerHelper implements HelperContract
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
        let locale: string = this.configService.get<string> ("app.fakerLocale") ||
                             this.configService.get<string> ("app.locale") ||
                             this.configService.get<string> ("app.fallbackLocale"),
            driver = (language: string): any => require (`@faker-js/faker/locale/${language}`);

        try {

            return driver (locale).faker;

        } catch (thrower: unknown) {

            return driver ("en").faker;
        }
    }
};
