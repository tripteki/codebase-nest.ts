"use strict";

import { Controller, Get, Res, HttpStatus, } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, } from "@nestjs/swagger";
import { Request, Response, } from "express";
import { VersionService, } from "src/version/services/service.version";

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
     * @param {Response} response
     * @returns {void}
     */
    async index (@Res () response: Response): Promise<void>
    {
        response.
        status (HttpStatus.OK).
        send (
        {
            data: (await this.versionService.variable ()),
        });
    }
};
