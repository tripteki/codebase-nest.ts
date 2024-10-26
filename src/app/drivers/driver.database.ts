"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory, } from "@nestjs/typeorm";
import { DataSource, } from "typeorm";
import { join, } from "path";
import configHelper from "../helpers/helper.config";

/**
 * @abstract
 * @class
 */
abstract class DatabaseDriver
{
    /**
     * @returns {Object}
     */
    protected createCommonOptions (): Object
    {
        return {

            migrationsRun: false,
            synchronize: false,

            migrations: [

                join (__dirname, "../../", "**/migration.*{.ts,.js}"),
            ],

            entities: [

                join (__dirname, "../../", "**/entity.*{.ts,.js}"),
            ],
        };
    }
};

@Injectable ()
/**
 * @class
 * @implements {TypeOrmOptionsFactory}
 * @extends {DatabaseDriver}
 */
export class SqliteDriverConfigService extends DatabaseDriver implements TypeOrmOptionsFactory
{
    /**
     * @param {ConfigService} configService
     * @returns {void}
     */
    constructor (
        private readonly configService: ConfigService
    )
    {
        super ();
    }

    /**
     * {@link https://typeorm.io/data-source-options#sqlite-data-source-options Sqlite}
     * @returns {TypeOrmModuleOptions}
     */
    public createTypeOrmOptions (): TypeOrmModuleOptions
    {
        return {

            name: "sqliteConnection",
            type: "sqlite",
            ... this.createCommonOptions (),
            ... this.configService.get<Object> ("database.sqlite"),
        };
    }
};

@Injectable ()
/**
 * @class
 * @implements {TypeOrmOptionsFactory}
 * @extends {DatabaseDriver}
 */
export class MongoDriverConfigService extends DatabaseDriver implements TypeOrmOptionsFactory
{
    /**
     * @param {ConfigService} configService
     * @returns {void}
     */
    constructor (
        private readonly configService: ConfigService
    )
    {
        super ();
    }

    /**
     * {@link https://typeorm.io/data-source-options#mongodb-data-source-options Mongo}
     * @returns {TypeOrmModuleOptions}
     */
    public createTypeOrmOptions (): TypeOrmModuleOptions
    {
        return {

            name: "mongoConnection",
            type: "mongodb",
            ... this.createCommonOptions (),
            ... this.configService.get<Object> ("database.mongo"),
        };
    }
};

@Injectable ()
/**
 * @class
 * @implements {TypeOrmOptionsFactory}
 * @extends {DatabaseDriver}
 */
export class PostgreDriverConfigService extends DatabaseDriver implements TypeOrmOptionsFactory
{
    /**
     * @param {ConfigService} configService
     * @returns {void}
     */
    constructor (
        private readonly configService: ConfigService
    )
    {
        super ();
    }

    /**
     * {@link https://typeorm.io/data-source-options#postgres--cockroachdb-data-source-options Postgre}
     * @returns {TypeOrmModuleOptions}
     */
    public createTypeOrmOptions (): TypeOrmModuleOptions
    {
        return {

            name: "postgreConnection",
            type: "postgres",
            ... this.createCommonOptions (),
            ... this.configService.get<Object> ("database.postgre"),
        };
    }
};

@Injectable ()
/**
 * @class
 * @implements {TypeOrmOptionsFactory}
 * @extends {DatabaseDriver}
 */
export class MariaDriverConfigService extends DatabaseDriver implements TypeOrmOptionsFactory
{
    /**
     * @param {ConfigService} configService
     * @returns {void}
     */
    constructor (
        private readonly configService: ConfigService
    )
    {
        super ();
    }

    /**
     * {@link https://typeorm.io/data-source-options#mysql--mariadb-data-source-options Maria}
     * @returns {TypeOrmModuleOptions}
     */
    public createTypeOrmOptions (): TypeOrmModuleOptions
    {
        return {

            name: "mariaConnection",
            type: "mariadb",
            ... this.createCommonOptions (),
            ... this.configService.get<Object> ("database.maria"),
        };
    }
};

/**
 * @function
 * @returns {DataSource}
 */
export const AppDataSource = (() =>
{
    const

    databaseConfig = configHelper ("database"),
    migrator: string = process.env.MIGRATOR || "postgre";

    return new DataSource ({

        ... new exports[((migrator.charAt (0).toUpperCase () + migrator.slice (1)) + "DriverConfigService")] (new ConfigService ()).createTypeOrmOptions (),
        ... databaseConfig[migrator],
    });
}) ();
