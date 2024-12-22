"use strict";

import { Express, Request, Response, } from "express";
import { FileInterceptor, } from "@nestjs/platform-express";
import { applyDecorators, UseInterceptors, } from "@nestjs/common";
import { ApiConsumes, ApiParam, ApiBody, ApiResponse, } from "@nestjs/swagger";
import { Status, Message, } from "src/app/dtos/app.dto";
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
            status: Status.OK,
            description: Message.OK,
        }),
        ApiResponse ({
            status: Status.BAD_REQUEST,
            description: Message.UNVALIDATED,
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
            status: Status.OK,
            description: Message.OK,
        }),
        ApiResponse ({
            status: Status.BAD_REQUEST,
            description: Message.UNVALIDATED,
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
            status: Status.OK,
            description: Message.OK,
        }),
        ApiResponse ({
            status: Status.BAD_REQUEST,
            description: Message.UNVALIDATED,
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
            status: Status.CREATED,
            description: Message.CREATED,
        }),
        ApiResponse ({
            status: Status.BAD_REQUEST,
            description: Message.UNVALIDATED,
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
            status: Status.OK,
            description: Message.OK,
        }),
        ApiResponse ({
            status: Status.BAD_REQUEST,
            description: Message.UNVALIDATED,
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
