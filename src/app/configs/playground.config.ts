"use strict";

import { registerAs, } from "@nestjs/config";

export default registerAs ("playground", () => ({

    /**
     * -----------------------------------------------------
     * GRAPHQL Documentation Path
     * -----------------------------------------------------
     *
     * Defines the path where the Playground documentation will be served.
     * This value can be configured using `process.env.PLAYGROUND_PATH`,
     * or defaults to "graphql" if not provided.
     */
    path: String (process.env.PLAYGROUND_PATH || "graphql"),

}));
