"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { HelperContract, } from "src/app/contracts/helper.contract";

@Injectable ()
/**
 * @class {HasherHelper}
 * @implements {HelperContract}
 */
export class HasherHelper implements HelperContract
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
        let driver: string = this.configService.get<string> ("hash.driver");

        if (driver === "bcrypt") return require ("bcrypt");
        else if (driver === "argon") return require ("argon2");
    }

    /**
     * @param {string} plainText
     * @returns {Promise<string>}
     */
    public async hash (plainText: string): Promise<string>
    {
        let round: string = this.configService.get<string> ("hash.round");

        return await this.ref ().hash (plainText, round);
    }

    /**
     * @param {string} hashedText
     * @param {string} plainText
     * @returns {Promise<string>}
     */
    public async verify (hashedText: string, plainText: string): Promise<string>
    {
        let driver: string = this.configService.get<string> ("hash.driver");

        if (driver === "bcrypt") return await this.ref ().compare (plainText, hashedText);
        else if (driver === "argon") return await this.ref ().verify (hashedText, plainText);
    }
};
