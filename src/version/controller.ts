"use strict";

import { Controller, Get, Res, HttpStatus, } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, } from "@nestjs/swagger";
import { FastifyRequest as Request, FastifyReply as Response, } from "fastify";
import { VersionService, } from "src/version/service";

@ApiTags ("Version")
@Controller ({

    version: "1",
})
/**
 * @class
 */
export class VersionController
{
    /**
     * @param {VersionService} versionService
     * @returns {void}
     */
    constructor (private readonly versionService: VersionService)
    {
        //
    }

    @Get ("/versions")
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
            data: this.versionService.variable (),
        });
    }
};
