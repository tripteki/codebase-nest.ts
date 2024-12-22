"use strict";

import { ZodSchema, } from "zod";
import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";

@Injectable ()
/**
 * @class {AppValidatorPipeMiddleware}
 * @implements {PipeTransform}
 */
export class AppValidatorPipeMiddleware implements PipeTransform
{
    /**
     * @param {ZodSchema} zodSchema
     * @param {ConfigService} configService
     * @returns {void}
     */
    constructor (
        protected readonly zodSchema: ZodSchema,
        protected readonly configService: ConfigService
    )
    {
        //
    }

    /**
     * @param {any} value
     * @param {ArgumentMetadata} metadata
     * @returns {any}
     */
    public transform (value: any, metadata: ArgumentMetadata): any
    {
        try {

            return this.zodSchema.parse (value);

        } catch {

            throw new BadRequestException ("Validation Error");
        }
    }
};
