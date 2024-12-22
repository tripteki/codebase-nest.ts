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
        response: Response = context.switchToHttp ().getResponse (),
        frontendUrl: string = this.configService.get<string> ("app.frontendUrl"),
        originalUrl: string = request.originalUrl,
        cleanedUrl: string = originalUrl.replace (/^\/api\/v1/, "").replace (/^\/v1/, "");

        try {

            this.urlHelper.ref ().verify (decodeURIComponent (`${frontendUrl}${cleanedUrl}`));

        } catch {

            throw new ForbiddenException ("Not Signed");
        }

        return true;
    }
};
