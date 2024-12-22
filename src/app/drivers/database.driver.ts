"use strict";

import { Injectable, OnModuleInit, OnModuleDestroy, } from "@nestjs/common";
import { PrismaClient as PrismaPostgreClient, } from "@prisma/postgre/client";
import { PrismaClient as PrismaMongoClient, } from "@prisma/mongo/client";

@Injectable ()
/**
 * {@link https://www.prisma.io/docs/orm/overview/databases/postgresql Prisma Postgre}
 * @class {DatabasePrismaPostgreDriver}
 * @extends {PrismaPostgreClient}
 * @implements {OnModuleInit}
 * @implements {OnModuleDestroy}
 */
export class DatabasePrismaPostgreDriver extends PrismaPostgreClient implements OnModuleInit, OnModuleDestroy
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
 * @extends {PrismaMongoClient}
 * @implements {OnModuleInit}
 * @implements {OnModuleDestroy}
 */
export class DatabasePrismaMongoDriver extends PrismaMongoClient implements OnModuleInit, OnModuleDestroy
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
