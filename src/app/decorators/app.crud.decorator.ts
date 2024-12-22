"use strict";

import { applyDecorators, } from "@nestjs/common";
import { ApiParam, ApiBody, ApiResponse, } from "@nestjs/swagger";

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
