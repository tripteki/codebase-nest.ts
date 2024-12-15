"use strict";

import {

    HttpException,
    Type,
    ConfigService,
    ExecutionContext,
    IntentExceptionFilter,

} from "@intentjs/core";

export class ApplicationExceptionFilter extends IntentExceptionFilter
{
    /**
     * @param { ConfigService } config
     * @returns { void }
     */
    constructor (private config: ConfigService)
    {
        super ();
    }

    /**
     * @param { ExecutionContext } context
     * @param { any } exception
     * @returns { Promise<any> }
     */
    public async handleHttp (context: ExecutionContext, exception: any): Promise<any>
    {
        return super.handleHttp (context, exception);
    }

    /**
     * @returns { Array<Type<HttpException>> }
     */
    public doNotReport (): Array<Type<HttpException>>
    {
        return [

            //
        ];
    }

    /**
     * @returns { Array<Type<HttpException>> | string }
     */
    public report (): Array<Type<HttpException>> | string
    {
        return "*";
    }
};
