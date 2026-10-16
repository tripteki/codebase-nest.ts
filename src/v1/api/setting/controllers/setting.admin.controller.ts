import { Request, } from "express";
import { Body, Controller, Get, HttpCode, Post, Put, Req, UploadedFiles, UseGuards, UseInterceptors, } from "@nestjs/common";
import { Throttle as ThrottleMiddleware, ThrottlerGuard as ThrottleGuardMiddleware, } from "@nestjs/throttler";
import { AnyFilesInterceptor, } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiTags, } from "@nestjs/swagger";
import { Status, } from "src/app/dtos/app.dto";
import { SettingTransformerDto, } from "src/v1/api/setting/dtos/setting.transformer.dto";
import { SettingBatchValidatorDto, } from "src/v1/api/setting/dtos/setting.validator.dto";
import { SettingAdminService, } from "src/v1/api/setting/services/setting.admin.service";
import { UserAuthAccessTokenMetadataMiddleware, } from "src/v1/api/user/dtos/user.auth.enum";
import { UserHttpAuthGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.guard.middleware";
import { UserHttpVerificationGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.verification.guard.middleware";

@ApiTags ("SettingAdmin")
@Controller ("/v1/admin/settings")
/**
 * @class {SettingAdminController}
 */
export class SettingAdminController
{
    /**
     * @param {SettingAdminService} settingAdminService
     * @returns {void}
     */
    constructor (
        protected readonly settingAdminService: SettingAdminService
    )
    {
        //
    }

    @Get ("/")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    /**
     * @param {Request} request
     * @returns {Promise<{ data: SettingTransformerDto[]; }>}
     */
    public async index (
        @Req () request: Request
    ): Promise<{ data: SettingTransformerDto[]; }>
    {
        return this.settingAdminService.all (request["user"].sub);
    }

    @Put ("/")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    /**
     * @param {Request} request
     * @param {SettingBatchValidatorDto} inputs
     * @returns {Promise<{ data: SettingTransformerDto[]; }>}
     */
    public async update (
        @Req () request: Request,
        @Body () inputs: SettingBatchValidatorDto
    ): Promise<{ data: SettingTransformerDto[]; }>
    {
        return this.settingAdminService.sync (request["user"].sub, inputs);
    }

    @Post ("/")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UseInterceptors (AnyFilesInterceptor ({ limits: { fileSize: 2 * 1024 * 1024, }, }))
    @ApiBearerAuth ()
    /**
     * @param {Request} request
     * @param {Express.Multer.File[]} files
     * @returns {Promise<{ data: SettingTransformerDto[]; }>}
     */
    public async updateMultipart (
        @Req () request: Request,
        @UploadedFiles () files: Express.Multer.File[]
    ): Promise<{ data: SettingTransformerDto[]; }>
    {
        return this.settingAdminService.syncMultipart (request["user"].sub, request.body || {}, files || []);
    }
}
