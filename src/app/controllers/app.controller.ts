"use strict";

import { Controller, HttpStatus, Body, Get, Post, Put, Patch, Delete, Res, Render, } from "@nestjs/common";
import { ApiTags, } from "@nestjs/swagger";
import { HealthCheckService, HealthCheck, HealthCheckResult, MemoryHealthIndicator, } from "@nestjs/terminus";
import { ConfigService, } from "@nestjs/config";

@ApiTags ("Health")
@Controller ()
/**
 * @class {AppController}
 */
export class AppController
{
    /**
     * @param {HealthCheckService} healthService
     * @param {MemoryHealthIndicator} memoryHealth
     * @param {ConfigService} configService
     * @returns {void}
     */
    constructor (
        protected readonly healthService: HealthCheckService,
        private readonly memoryHealth: MemoryHealthIndicator,
        private readonly configService: ConfigService
    )
    {
        //
    }

    @Get ("/status")
    @HealthCheck ({ swaggerDocumentation: true, })
    /**
     * @returns {Promise<HealthCheckResult>}
     */
    public async status (): Promise<HealthCheckResult>
    {
        const isProduction: boolean = this.configService.get<string> ("app.env") === "production";
        const threshold: number = isProduction
            ? 150 * 1024 * 1024
            : 500 * 1024 * 1024;

        return await this.healthService.check ([

            () => this.memoryHealth.checkHeap ("memory_allocation", threshold),
            () => this.memoryHealth.checkRSS ("memory_total", threshold),
        ]);
    }
};
