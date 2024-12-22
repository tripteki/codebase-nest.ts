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
