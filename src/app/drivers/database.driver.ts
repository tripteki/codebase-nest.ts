"use strict";

import { Injectable, OnModuleInit, OnModuleDestroy, } from "@nestjs/common";
import { PrismaClient as DatabasePrismaPostgreClient, } from "@prisma/client";
import { PrismaClient as DatabasePrismaMongoClient, } from "@prisma/mongo/client";

@Injectable ()
/**
 * {@link https://www.prisma.io/docs/orm/overview/databases/postgresql Prisma Postgre}
 * @class {DatabasePrismaPostgreDriver}
 * @extends {DatabasePrismaPostgreClient}
 * @implements {OnModuleInit}
 * @implements {OnModuleDestroy}
 */
export class DatabasePrismaPostgreDriver extends DatabasePrismaPostgreClient implements OnModuleInit, OnModuleDestroy
{
    /**
     * @returns {Promise<void>}
     */
    public async onModuleInit (): Promise<void>
    {
        await this.$connect ();
    }

    /**
     * @returns {Promise<void>}
     */
    public async onModuleDestroy (): Promise<void>
    {
        await this.$disconnect ();
    }
};

@Injectable ()
/**
 * {@link https://www.prisma.io/docs/orm/overview/databases/mongodb Prisma Mongo}
 * @class {DatabasePrismaMongoDriver}
 * @extends {DatabasePrismaMongoClient}
 * @implements {OnModuleInit}
 * @implements {OnModuleDestroy}
 */
export class DatabasePrismaMongoDriver extends DatabasePrismaMongoClient implements OnModuleInit, OnModuleDestroy
{
    /**
     * @type {boolean}
     */
    protected readonly mongoEnabled: boolean;

    /**
     * @returns {void}
     */
    constructor ()
    {
        const mongoUri = String (process.env.DATABASE_MONGO_URI || "").trim ();

        super ({
            datasourceUrl: mongoUri || "mongodb://127.0.0.1:27017/off",
        });

        this.mongoEnabled = mongoUri.length > 0;
    }

    /**
     * @returns {Promise<void>}
     */
    public async onModuleInit (): Promise<void>
    {
        if (! this.mongoEnabled) return;

        await this.$connect ();
    }

    /**
     * @returns {Promise<void>}
     */
    public async onModuleDestroy (): Promise<void>
    {
        if (! this.mongoEnabled) return;

        await this.$disconnect ();
    }
};
