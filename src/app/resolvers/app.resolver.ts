"use strict";

import { ConfigService, } from "@nestjs/config";
import { Resolver, Args, Query, Mutation, } from "@nestjs/graphql";

@Resolver ()
/**
 * @class {AppResolver}
 */
export class AppResolver
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

    @Query (() => String)
    /**
     * @returns {string}
     */
    version (): string
    {
        return this.configService.get<string> ("app.version");
    }
};
