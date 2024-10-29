"use strict";

import { join, } from "path";
import { registerAs, } from "@nestjs/config";

export default registerAs ("database", () => (
{
    /**
     * Database Source [See for more detail.](https://typeorm.io/data-source-options#sqlite-data-source-options).
     */
    sqlite: {

        database: join (__dirname, "../../../", "storage/datas/"),
    },

    /**
     * Database Source [See for more detail.](https://typeorm.io/data-source-options#mongodb-data-source-options).
     */
    mongo: {

        url: String (process.env.MONGO_URI),

        migrationsTableName: "migrations",
    },

    /**
     * Database Source [See for more detail.](https://typeorm.io/data-source-options#postgres--cockroachdb-data-source-options).
     */
    postgre: {

        url: String (process.env.POSTGRE_URI),

        migrationsTableName: "migrations",
    },

    /**
     * Database Source [See for more detail.](https://typeorm.io/data-source-options#mysql--mariadb-data-source-options).
     */
    maria: {

        url: String (process.env.MARIA_URI),

        migrationsTableName: "migrations",
    },
}));
