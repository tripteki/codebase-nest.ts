"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { HasherBcryptModuleOptions, HasherArgonModuleOptions, HasherModuleOptionsFactory, } from "@sinuos/nestjs-hasher/dist/interfaces";

@Injectable ()
/**
 * @class
 * @implements {HasherModuleOptionsFactory}
 */
export class BcryptDriverConfigService implements HasherModuleOptionsFactory
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
     * @returns {Promise<HasherArgonModuleOptions>|HasherArgonModuleOptions}
     */
    public createHasherOptions (): Promise<HasherBcryptModuleOptions>|HasherBcryptModuleOptions
    {
        return {

            ... this.configService.get<Record<string, any>> ("hash.bcrypt"),
            round: this.configService.get<number> ("hash.bcrypt.round"),

            provider: "bcrypt",
        };
    }
};

@Injectable ()
/**
 * @class
 * @implements {HasherModuleOptionsFactory}
 */
export class ArgonDriverConfigService implements HasherModuleOptionsFactory
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
     * @returns {Promise<HasherArgonModuleOptions>|HasherArgonModuleOptions}
     */
    public createHasherOptions (): Promise<HasherArgonModuleOptions>|HasherArgonModuleOptions
    {
        return {

            ... this.configService.get<Record<string, any>> ("hash.bcrypt"),

            provider: "argon",
        };
    }
};
