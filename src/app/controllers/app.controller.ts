"use strict";

import { Controller, HttpStatus, HttpCode, Body, Get, Post, Put, Patch, Delete, Res, Render, } from "@nestjs/common";
import { ApiTags, ApiResponse, } from "@nestjs/swagger";
import { HealthCheckService, HealthCheck, HealthCheckResult, MemoryHealthIndicator, } from "@nestjs/terminus";
import { ConfigService, } from "@nestjs/config";
import { Status, Message, } from "src/app/dtos/app.dto";

@ApiTags ("Stats")
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

    @Get ("/version")
    @HttpCode (Status.OK)
    @ApiResponse ({
        status: Status.OK,
        description: Message.OK,
    })
    /**
     * @returns {Promise<{ version: string }>}
     */
    public async version (): Promise<{ version: string }>
    {
        return {
            version: this.configService.get<string> ("app.version"),
        };
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
