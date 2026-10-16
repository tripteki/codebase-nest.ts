"use strict";

import { Controller, HttpCode, Get, Inject, UseGuards, } from "@nestjs/common";
import { Throttle as ThrottleMiddleware, ThrottlerGuard as ThrottleGuardMiddleware, } from "@nestjs/throttler";
import { ApiTags, ApiResponse, } from "@nestjs/swagger";
import { CACHE_MANAGER, } from "@nestjs/cache-manager";
import { Cache, } from "cache-manager";
import { ConfigService, } from "@nestjs/config";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { Status, Message, } from "src/app/dtos/app.dto";

@ApiTags ("Stats")
@Controller ()
/**
 * @class {AppController}
 */
export class AppController
{
    /**
     * @param {ConfigService} configService
     * @param {DatabasePrismaPostgreDriver} database
     * @param {Cache} cache
     * @returns {void}
     */
    constructor (
        private readonly configService: ConfigService,
        private readonly database: DatabasePrismaPostgreDriver,
        @Inject (CACHE_MANAGER)
        private readonly cache: Cache
    )
    {
        //
    }

    @Get ("/version")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 5, ttl: 5000, }, })
    @ApiResponse ({
        status: Status.OK,
        description: Message.OK,
    })
    /**
     * @returns {Promise<{ status: number; message: string; data: { version: string } }>}
     */
    public async version (): Promise<{ status: number; message: string; data: { version: string } }>
    {
        return {
            status: Status.OK,
            message: Message.OK,
            data: {
                version: this.configService.get<string> ("app.version"),
            },
        };
    }

    @Get ("/status")
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 5000, }, })
    /**
     * @returns {Promise<{ status: number; message: string; data: { status: string; memory: Record<string, Record<string, unknown>> | null; database: Record<string, unknown>; cache: Record<string, unknown> } }>}
     */
    public async status (): Promise<{ status: number; message: string; data: { status: string; memory: Record<string, Record<string, unknown>> | null; database: Record<string, unknown>; cache: Record<string, unknown> } }>
    {
        const isProduction: boolean = this.configService.get<string> ("app.env") === "production";
        const threshold: number = isProduction
            ? 150 * 1024 * 1024
            : 500 * 1024 * 1024;
        const memory = process.memoryUsage ();
        const memoryAllocation = this.memoryCheck ("heap_used", memory.heapUsed, threshold);
        const memoryTotal = this.memoryCheck ("rss_used", memory.rss, threshold);
        const database = await this.databaseCheck ();
        const cache = await this.cacheCheck ();
        const checks = [ memoryAllocation.status, memoryTotal.status, database.status, cache.status, ];

        return {
            status: Status.OK,
            message: Message.OK,
            data: {
                status: checks.every ((item: unknown): boolean => item === "up") ? "up" : "down",
                memory: {
                    memory_allocation: memoryAllocation,
                    memory_total: memoryTotal,
                },
                database,
                cache,
            },
        };
    }

    /**
     * @param {string} usedKey
     * @param {number} used
     * @param {number} threshold
     * @returns {Record<string, unknown>}
     */
    protected memoryCheck (usedKey: string, used: number, threshold: number): Record<string, unknown>
    {
        return {
            status: used < threshold ? "up" : "down",
            [usedKey]: used,
            [`${usedKey}_mb`]: Math.round ((used / (1024 * 1024)) * 100) / 100,
            threshold,
            threshold_mb: Math.round ((threshold / (1024 * 1024)) * 100) / 100,
        };
    }

    /**
     * @returns {Promise<Record<string, unknown>>}
     */
    protected async databaseCheck (): Promise<Record<string, unknown>>
    {
        try {
            await this.database.$queryRaw`SELECT 1`;

            return { status: "up", };
        }
        catch (error) {
            return {
                status: "down",
                error: error instanceof Error ? error.message : String (error),
            };
        }
    }

    /**
     * @returns {Promise<Record<string, unknown>>}
     */
    protected async cacheCheck (): Promise<Record<string, unknown>>
    {
        try {
            const store = this.cache.store as { client?: { ping: () => Promise<unknown> } };

            if (store.client) await store.client.ping ();
            else await this.cache.set ("health", "1", 1000);

            return { status: "up", };
        }
        catch (error) {
            return {
                status: "down",
                error: error instanceof Error ? error.message : String (error),
            };
        }
    }
};
