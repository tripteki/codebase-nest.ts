"use strict";

import { applyDecorators, } from "@nestjs/common";
import { ApiResponse, } from "@nestjs/swagger";
import { Status, Message, } from "src/app/dtos/app.dto";

type AppApiStandardResponsesOptions = {
    unauthorized?: boolean;
    forbidden?: boolean;
    unvalidated?: boolean;
};

/**
 * @function {AppApiStandardResponsesDecorator}
 * @param {AppApiStandardResponsesOptions} options
 * @returns {MethodDecorator}
 */
export function AppApiStandardResponsesDecorator (
    options: AppApiStandardResponsesOptions = {}
): MethodDecorator
{
    const decorators: MethodDecorator[] = [];

    if (options.unauthorized) {
        decorators.push (
            ApiResponse ({
                status: Status.UNAUTHORIZED,
                description: Message.UNAUTHORIZED,
                schema: {
                    example: { detail: "string", },
                },
            })
        );
    }

    if (options.forbidden) {
        decorators.push (
            ApiResponse ({
                status: Status.FORBIDDEN,
                description: "Forbidden",
                schema: {
                    example: { detail: "string", },
                },
            })
        );
    }

    if (options.unvalidated) {
        decorators.push (
            ApiResponse ({
                status: Status.UNPROCESSABLE_ENTITY,
                description: Message.UNVALIDATED,
                schema: {
                    example: {
                        detail: [
                            {
                                type: "value_error",
                                loc: ["body", "field"],
                                msg: "string",
                                input: {},
                                ctx: { error: "string", },
                            },
                        ],
                    },
                },
            })
        );
    }

    return applyDecorators (...decorators);
}
