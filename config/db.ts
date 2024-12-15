"use strict";

import {

    configNamespace,
    DatabaseOptions,

} from "@intentjs/core";

import { knexSnakeCaseMappers, } from "objection";

export default configNamespace ("db", (): DatabaseOptions => ({

    /**
     * -----------------------------------------------------
     * Global Database Configuration
     * -----------------------------------------------------
     *
     * This configuration defines the database connection settings for your application.
     * It is registered globally, so the configuration will be accessible throughout the application.
     */
    isGlobal: true,

    /**
     * -----------------------------------------------------
     * Default Database Connection
     * -----------------------------------------------------
     * Documentation - https://tryintent.com/docs/databases/getting-started
     *
     * This specifies the default database connection to use.
     */
    default: process.env.DEFAULT_DATABASE || "pg",

    /**
     * -----------------------------------------------------
     * Database Connections Configuration
     * -----------------------------------------------------
     *
     * Inside "connections", we define the different database configurations.
     *
     * Drivers: "pg".
     */
    connections: {

        pg: {

            client: "pg",
            debug: !!+process.env.DB_DEBUG,
            useNullAsDefault: true,

            migrations: {

                directory: "./database/migrations",
            },

            connection: {

                host: process.env.DB_HOST,
                port: Number (process.env.DB_PORT),
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                charset: "utf8",
            },

            ... knexSnakeCaseMappers (),
        },
    },

}));
