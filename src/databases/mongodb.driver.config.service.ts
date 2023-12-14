"use strict";

import { Injectable, OnModuleInit, OnModuleDestroy, } from "@nestjs/common";
import { PrismaClient, } from "@prisma/mongodb/client";

@Injectable ()
/**
 * @class
 * @implements {OnModuleInit}
 */
export class PrismaMongodbDriverConfigService extends PrismaClient implements OnModuleInit, OnModuleDestroy
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
