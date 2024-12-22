"use strict";

import { Request, Response, } from "express";
import { Injectable, ExecutionContext, CanActivate, ForbiddenException, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { UrlHelper, } from "src/app/helpers/url.helper";

@Injectable ()
/**
 * @class {AppUrlGuardMiddleware}
 * @implements {CanActivate}
 */
export class AppUrlGuardMiddleware implements CanActivate
{
    /**
     * @param {ConfigService} configService
     * @param {UrlHelper} urlHelper
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        private readonly urlHelper: UrlHelper
    )
    {
        //
    }

    /**
     * @param {ExecutionContext} context
     * @returns {Promise<boolean>}
     */
    public async canActivate (context: ExecutionContext): Promise<boolean>
    {
        const

        request: Request = context.switchToHttp ().getRequest (),
        response: Response = context.switchToHttp ().getResponse ();

        try {

            this.urlHelper.ref ().verify (decodeURIComponent (`${request.get ("origin") || request.protocol + '://' + request.get ("host")}${request.originalUrl}`));

        } catch {

            throw new ForbiddenException ("Not Signed");
        }

        return true;
    }
};
