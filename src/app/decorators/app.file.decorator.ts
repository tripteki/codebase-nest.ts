"use strict";

import { Request, Response, } from "express";
import { FileInterceptor, } from "@nestjs/platform-express";
import { applyDecorators, UseInterceptors, UploadedFile, Injectable, PipeTransform, UnprocessableEntityException, } from "@nestjs/common";
import { ApiConsumes, ApiParam, ApiBody, } from "@nestjs/swagger";
import { diskStorage, } from "multer";
import { extname, } from "path";
import { assertImportUpload, } from "src/app/http/app.upload.guard";

/**
 * @function {AppApiFileDecorator}
 * @param {string} field
 * @param {string} destination
 * @returns {MethodDecorator}
 */
export function AppApiFileDecorator (
    field: string = "file",
    destination: string
): MethodDecorator
{
    return applyDecorators (
        UseInterceptors (FileInterceptor (field, {
            storage: diskStorage ({
                destination,
                filename: (
                    request: Request, file: Express.Multer.File,
                    callback: (
                        error: Error | null,
                        filename: string
                    ) => void): void =>
                {
                    callback (null, `${Date.now ()}${extname (file.originalname)}`);
                },
            }),
        })),
        ApiConsumes ("multipart/form-data"),
        ApiBody ({
            required: true,
            schema: {
                type: "object",
                properties: {
                    file: {
                        type: "string",
                        format: "binary",
                    },
                },
            },
            description: "The file",
        })
    );
};

@Injectable ()
/**
 * @class {AppImportFilePipe}
 */
export class AppImportFilePipe implements PipeTransform<Express.Multer.File | undefined, Express.Multer.File>
{
    /**
     * @param {Express.Multer.File | undefined} file
     * @returns {Express.Multer.File}
     */
    public transform (file?: Express.Multer.File): Express.Multer.File
    {
        if (! file) {
            throw new UnprocessableEntityException ({
                detail: [
                    { type: "missing", loc: [ "body", "file", ], msg: "Field required", input: null, ctx: {}, },
                ],
            });
        }

        assertImportUpload (file);

        return file;
    }
}

/**
 * @function {AppFileDecorator}
 * @returns {ParameterDecorator}
 */
export function AppFileDecorator (): ParameterDecorator
{
    return UploadedFile (AppImportFilePipe);
};
