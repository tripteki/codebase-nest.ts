"use strict";

import { Controller, Get, Res, HttpStatus, } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, } from "@nestjs/swagger";
import { FastifyRequest as Request, FastifyReply as Response, } from "fastify";
import { AppService, } from "./app.service";

@ApiTags ("Admin")
@Controller ()
/**
 * @class
 */
export class AppController
{
    /**
     * @param {AppService} appService
     * @returns {void}
     */
    constructor (private readonly appService: AppService)
    {
        //
    }

    @Get ("/admin")
    @ApiOperation ({
        summary: "Index",
    })
    @ApiResponse ({
        status: 200,
        description: "Success.",
    })
    /**
     * @param {FastifyReply} response
     * @returns {void}
     */
    index (@Res () response: Response): void
    {
        response.
        status (HttpStatus.OK).
        send (
        {
            data: this.appService.variable (),
        });
    }
};
