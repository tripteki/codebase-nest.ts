"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { JwtOptionsFactory, JwtModuleOptions, } from "@nestjs/jwt";
import { StringHelper, } from "src/app/helpers/string.helper";

@Injectable ()
/**
 * @class {AuthJwtDriver}
 * @implements {JwtOptionsFactory}
 */
export class AuthJwtDriver implements JwtOptionsFactory
{
    /**
     * @param {ConfigService} configService
     * @param {StringHelper} stringHelper
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        private readonly stringHelper: StringHelper
    )
    {
        //
    }

    /**
     * @returns {Promise<JwtModuleOptions>}
     */
    public async createJwtOptions (): Promise<JwtModuleOptions>
    {
        return {

            ... this.configService.get<JwtModuleOptions> ("auth"),
        };
    }
};
