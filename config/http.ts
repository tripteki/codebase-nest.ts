"use strict";

import {

    configNamespace,
    findProjectRoot,
    HttpConfig as HttpConfigOptions,

} from "@intentjs/core";

import { join, } from "path";

export default configNamespace ("http", (): HttpConfigOptions => ({

    /**
     * -----------------------------------------------------
     * Cross-Origin Resource Sharing (CORS) Configuration
     * -----------------------------------------------------
     *
     * CORS is a security feature implemented by browsers to restrict 
     * web pages from making requests to a domain different from the one
     * that served the web page. This section allows you to define your 
     * CORS settings to control how resources can be shared across different domains.
     */
    cors: {

        origin: true,
        credentials: true,
        allowedHeaders: [ "Content-Type", "Authorization", ],
        methods: [ "POST", "PUT", "PATCH", "DELETE", "GET", "OPTIONS", ],
    },

    /**
     * -----------------------------------------------------
     * Server Configuration
     * -----------------------------------------------------
     *
     * This section allows you to configure server-specific settings, 
     * such as maximum allowed body size for HTTP requests.
     */
    server: {

        max_body_buffer: 100000000,
        max_body_length: 100000000,
    },

    /**
     * -----------------------------------------------------
     * Static File Serving Configuration
     * -----------------------------------------------------
     *
     * Configuration for serving static files, including upload directories and file caching.
     */
    staticServe: {

        httpPath: "/",
        filePath: join (findProjectRoot (), "public"),

        keep: {

            extensions: [ "css", "js", "yml", "json", "png", "jpg", "jpeg", ],
        },

        cache: {

            max_file_count: 1000,
            max_file_size: 4 * 1024 * 1024,
        },
    },

}));
