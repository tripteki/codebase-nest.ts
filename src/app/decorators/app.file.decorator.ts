"use strict";

import { Request, Response, } from "express";
import { FileInterceptor, } from "@nestjs/platform-express";
import { applyDecorators, UseInterceptors, UploadedFile, ParseFilePipe, FileTypeValidator, } from "@nestjs/common";
import { ApiConsumes, ApiParam, ApiBody, } from "@nestjs/swagger";
import { diskStorage, } from "multer";
import { extname, } from "path";

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

/**
 * @function {AppFileDecorator}
 * @param {string | RegExp} fileType
 * @returns {ParameterDecorator}
 */
export function AppFileDecorator (
    fileType: string | RegExp = /^(text\/csv|application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)$/
): ParameterDecorator
{
    return UploadedFile (
        new ParseFilePipe ({
            validators: [
                new FileTypeValidator ({ fileType, }),
            ],
        })
    );
};
