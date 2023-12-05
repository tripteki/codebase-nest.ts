"use strict";

import { registerAs, } from "@nestjs/config";

export default registerAs ("swagger", () => (
{
    /**
     * Documentation title.
     */
    title: String (process.env.SWAGGER_TITLE || "Documentation"),

    /**
     * Documentation description.
     */
    description: String (process.env.SWAGGER_DESCRIPTION || "Documentation Description"),

    /**
     * Documentation version.
     */
    version: String (process.env.SWAGGER_VERSION || "1.0.0"),

    /**
     * Documentation path to serve.
     */
    path: String (process.env.SWAGGER_PATH || "docs"),
}));
