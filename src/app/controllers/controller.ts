"use strict";

import { HttpStatus, Controller, Body, Get, Post, Put, Patch, Delete, Res, } from "@nestjs/common";
import { HealthCheck, HealthCheckResult, HealthCheckService, MemoryHealthIndicator, TypeOrmHealthIndicator as DatabaseHealthIndicator, } from "@nestjs/terminus";
import { InjectConnection, } from "@nestjs/typeorm";
import { Connection, } from "typeorm";

@Controller ()
/**
 * @class
 */
export class AppController
{
    /**
     * @param {HealthCheckService} healthService
     * @param {MemoryHealthIndicator} memoryHealth
     * @param {DatabaseHealthIndicator} databaseHealth
     * @returns {void}
     */
    constructor (
        private readonly healthService: HealthCheckService,
        private readonly memoryHealth: MemoryHealthIndicator,
        private readonly databaseHealth: DatabaseHealthIndicator,
        @InjectConnection ("mongoConnection") private readonly mongoDatabaseHealth: Connection,
        @InjectConnection ("postgreConnection") private readonly postgreDatabaseHealth: Connection
    )
    {
        //
    }

    @Get ("/status")
    @HealthCheck ()
    /**
     * @returns {Promise<HealthCheckResult>}
     */
    public async status (): Promise<HealthCheckResult>
    {
        const threshold: number = 150 * 1024 * 1024;

        return await this.healthService.check ([

            () => this.memoryHealth.checkHeap ("memory_allocation", threshold),
            () => this.memoryHealth.checkRSS ("memory_total", threshold),
            () => this.databaseHealth.pingCheck ("database_mongo", { connection: this.mongoDatabaseHealth, }),
            () => this.databaseHealth.pingCheck ("database_postgre", { connection: this.postgreDatabaseHealth, }),
        ]);
    }
};
