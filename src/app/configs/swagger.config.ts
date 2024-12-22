"use strict";

import { registerAs, } from "@nestjs/config";

export default registerAs ("swagger", () => ({

    /**
     * -----------------------------------------------------
     * API Documentation Title
     * -----------------------------------------------------
     *
     * Specifies the title of the API documentation.
     * This value can be configured using `process.env.SWAGGER_TITLE`,
     * or defaults to "Documentation" if not provided.
     */
    title: String (process.env.SWAGGER_TITLE || "Documentation"),

    /**
     * -----------------------------------------------------
     * API Documentation Description
     * -----------------------------------------------------
     *
     * Provides a description for the API documentation.
     * This can be customized with `process.env.SWAGGER_DESCRIPTION`,
     * or defaults to "Documentation Description" if not set.
     */
    description: String (process.env.SWAGGER_DESCRIPTION || "Documentation Description"),

    /**
     * -----------------------------------------------------
     * API Documentation Version
     * -----------------------------------------------------
     *
     * Specifies the version of the API documentation.
     * It can be set via `process.env.SWAGGER_VERSION`, or falls back
     * to "1.0.0" if not provided.
     */
    version: String (process.env.SWAGGER_VERSION || "1.0.0"),

    /**
     * -----------------------------------------------------
     * API Documentation Path
     * -----------------------------------------------------
     *
     * Defines the path where the Swagger documentation will be served.
     * This value can be configured using `process.env.SWAGGER_PATH`,
     * or defaults to "docs" if not provided.
     */
    path: String (process.env.SWAGGER_PATH || "docs"),

}));
