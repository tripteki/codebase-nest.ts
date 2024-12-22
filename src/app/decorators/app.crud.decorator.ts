"use strict";

import { Express, Request, Response, } from "express";
import { FileInterceptor, } from "@nestjs/platform-express";
import { applyDecorators, UseInterceptors, } from "@nestjs/common";
import { ApiConsumes, ApiParam, ApiBody, ApiResponse, } from "@nestjs/swagger";
import { diskStorage, } from "multer";
import { extname, } from "path";

/**
 * @function {AppApiIndexCrudSpecDecorator}
 * @returns {MethodDecorator}
 */
export function AppApiIndexCrudSpecDecorator (): MethodDecorator
{
    return applyDecorators (
        ApiResponse ({
            status: 200,
            description: "Ok",
        }),
        ApiResponse ({
            status: 400,
            description: "Validation error",
        })
    );
};

/**
 * @function {AppApiShowCrudSpecDecorator}
 * @param {string} id
 * @returns {MethodDecorator}
 */
export function AppApiShowCrudSpecDecorator (
    id: string = "id"
): MethodDecorator
{
    return applyDecorators (
        ApiParam ({
            name: id,
            required: true,
            type: String,
            description: "The identifier",
        }),
        ApiResponse ({
            status: 200,
            description: "Ok",
        }),
        ApiResponse ({
            status: 400,
            description: "Validation error",
        })
    );
};

/**
 * @function {AppApiUpdateCrudSpecDecorator}
 * @param {string} id
 * @param {Record<string, string>} example
 * @returns {MethodDecorator}
 */
export function AppApiUpdateCrudSpecDecorator (
    id: string = "id",
    example: Record<string, string>
): MethodDecorator
{
    return applyDecorators (
        ApiParam ({
            name: id,
            required: true,
            type: String,
            description: "The identifier",
        }),
        ApiBody ({
            required: true,
            description: "The input",
            examples: { "application/json": { value: example, }, },
        }),
        ApiResponse ({
            status: 200,
            description: "Ok",
        }),
        ApiResponse ({
            status: 400,
            description: "Validation error",
        })
    );
};

/**
 * @function {AppApiStoreCrudSpecDecorator}
 * @param {Record<string, string>} example
 * @returns {MethodDecorator}
 */
export function AppApiStoreCrudSpecDecorator (
    example: Record<string, string>
): MethodDecorator
{
    return applyDecorators (
        ApiBody ({
            required: true,
            description: "The input",
            examples: { "application/json": { value: example, }, },
        }),
        ApiResponse ({
            status: 201,
            description: "Ok",
        }),
        ApiResponse ({
            status: 400,
            description: "Validation error",
        })
    );
};

/**
 * @function {AppApiDestroyCrudSpecDecorator}
 * @param {string} id
 * @returns {MethodDecorator}
 */
export function AppApiDestroyCrudSpecDecorator (
    id: string = "id"
): MethodDecorator
{
    return applyDecorators (
        ApiParam ({
            name: id,
            required: true,
            type: String,
            description: "The identifier",
        }),
        ApiResponse ({
            status: 200,
            description: "Ok",
        }),
        ApiResponse ({
            status: 400,
            description: "Validation error",
        })
    );
};

/**
 * @function {AppApiFileCrudSpecDecorator}
 * @param {string} field
 * @param {string} destination
 * @returns {MethodDecorator}
 */
export function AppApiFileCrudSpecDecorator (
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
