import { Controller, HttpStatus, Body, Get, Post, Put, Patch, Delete, Res, Render, } from "@nestjs/common";
import { ApiTags, } from "@nestjs/swagger";
import { HealthCheck, HealthCheckResult, HealthCheckService, MemoryHealthIndicator, } from "@nestjs/terminus";

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
     * @returns {void}
     */
    constructor (
        private readonly healthService: HealthCheckService,
        private readonly memoryHealth: MemoryHealthIndicator
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
        const threshold: number = 150 * 1024 * 1024;

        return await this.healthService.check ([

            () => this.memoryHealth.checkHeap ("memory_allocation", threshold),
            () => this.memoryHealth.checkRSS ("memory_total", threshold),
        ]);
    }
};
