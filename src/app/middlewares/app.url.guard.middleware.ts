"use strict";

import { Request, Response, } from "express";
import { Injectable, ExecutionContext, CanActivate, ForbiddenException, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
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
     * @param {I18nService} i18nService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        private readonly urlHelper: UrlHelper,
        private readonly i18nService: I18nService
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

            const key = cleanedUrl.includes ("/reset-password/")
                ? "_v1_user.auth.invalid_or_expired_reset_token"
                : "_v1_user.auth.invalid_or_expired_verify_link";

            throw new ForbiddenException (this.i18nService.t (key));
        }

        return true;
    }
};
