import { Request, } from "express";
import { renameSync, } from "fs";
import { extname, join, } from "path";
import { diskStorage, } from "multer";
import { Controller, HttpCode, Body, Param, Query, Get, Post, Put, Patch, Delete, Req, Res, UseGuards, UseInterceptors, UploadedFile, } from "@nestjs/common";
import { FileInterceptor, } from "@nestjs/platform-express";
import { Throttle as ThrottleMiddleware, ThrottlerGuard as ThrottleGuardMiddleware, } from "@nestjs/throttler";
import { ApiTags, ApiParam, ApiQuery, ApiBody, ApiResponse, ApiBearerAuth, ApiOperation, } from "@nestjs/swagger";
import { Status, Message, } from "src/app/dtos/app.dto";
import { OffsetPaginationType, CursorPaginationType, OffsetPagination, CursorPagination, Orderization, Filterization, } from "src/app/repositories/app.repository";
import { AppApiOrderQueryStringDecorator, AppOrderQueryStringDecorator, } from "src/app/decorators/app.order.decorator";
import { AppApiFilterQueryStringDecorator, AppFilterQueryStringDecorator, } from "src/app/decorators/app.filter.decorator";
import { AppApiCurrentPageQueryStringDecorator, AppApiLimitPageQueryStringDecorator, AppLimitPageQueryStringDecorator, AppCurrentPageQueryStringDecorator, } from "src/app/decorators/app.page.decorator";
import { AppApiFileDecorator, AppFileDecorator, } from "src/app/decorators/app.file.decorator";
import { assertAvatarUpload, } from "src/app/http/app.upload.guard";
import { AppApiIndexCrudSpecDecorator, AppApiDestroyCrudSpecDecorator, AppApiShowCrudSpecDecorator, AppApiStoreCrudSpecDecorator, AppApiUpdateCrudSpecDecorator, } from "src/app/decorators/app.crud.decorator";
import { ConfigService, } from "@nestjs/config";
import { UserAdminService, } from "src/v1/api/user/services/user.admin.service";
import { UserTransformerDto, } from "src/v1/api/user/dtos/user.transformer.dto";
import { UserIdentifierDto, UserUpdateValidatorDto, UserCreateValidatorDto, UserExportTypeDto, } from "src/v1/api/user/dtos/user.validator.dto";
import { UserAuthAccessTokenMetadataMiddleware, UserAuthRefreshTokenMetadataMiddleware, } from "src/v1/api/user/dtos/user.auth.enum";
import { UserImportDescription, UserExportDescription, } from "src/v1/api/user/dtos/user.api.dto";
import { UserHttpAuthGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.guard.middleware";
import { UserHttpVerificationGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.verification.guard.middleware";
import { UserHttpPermissionGuardMiddleware, UserPermissionMetadataMiddleware, } from "src/v1/api/user/middlewares/user.permission.guard.middleware";

/**
 * @type {string}
 */
const AVATAR_DESTINATION = join (__dirname, "../../../../../storage/disks/public/avatars/");

/**
 * @type {ReturnType<typeof FileInterceptor>}
 */
const AvatarInterceptor = FileInterceptor ("avatar", {
    storage: diskStorage ({
        destination: AVATAR_DESTINATION,
        filename: (
            _request: Request,
            file: Express.Multer.File,
            callback: (error: Error | null, filename: string) => void
        ): void => {
            callback (null, `${Date.now ()}${extname (file.originalname)}`);
        },
    }),
});

/**
 * @param {Express.Multer.File | undefined} avatar
 * @returns {string | undefined}
 */
function storeAvatar (avatar?: Express.Multer.File): string | undefined
{
    if (! avatar) return undefined;

    const filename = `${Date.now ()}${assertAvatarUpload (avatar)}`;

    renameSync (avatar.path, join (AVATAR_DESTINATION, filename));

    return `avatars/${filename}`;
}

@ApiTags ("UserAdmin")
@Controller ("/v1/admin/users")
/**
 * @class {UserAdminController}
 */
export class UserAdminController
{
    /**
     * @param {ConfigService} configService
     * @param {UserAdminService} userAdminService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly userAdminService: UserAdminService
    )
    {
        //
    }

    @Get ("/")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("user.view")
    @AppApiOrderQueryStringDecorator ("orders")
    @AppApiFilterQueryStringDecorator ("filters")
    @AppApiLimitPageQueryStringDecorator ("limitPage")
    @AppApiCurrentPageQueryStringDecorator ("currentPage")
    @AppApiIndexCrudSpecDecorator ()
    @ApiBearerAuth ()
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNVERIFIED,
    })
    /**
     * @param {Request} request
     * @param {Orderization<UserTransformerDto>[]} orders
     * @param {Filterization<UserTransformerDto>[]} filters
     * @param {number} limitPage
     * @param {number} currentPage
     * @returns {Promise<OffsetPagination<UserTransformerDto>>}
     */
    public async index (
        @Req () request: Request,
        @AppOrderQueryStringDecorator ("orders") orders: Orderization<UserTransformerDto>[],
        @AppFilterQueryStringDecorator ("filters") filters: Filterization<UserTransformerDto>[],
        @AppLimitPageQueryStringDecorator ("limitPage") limitPage: number,
        @AppCurrentPageQueryStringDecorator ("currentPage") currentPage: number
    ): Promise<OffsetPagination<UserTransformerDto>>
    {
        return await this.userAdminService.all (
            { userId: request["user"].sub, },
            orders,
            filters,
            { limitPage, currentPage, }
        );
    }

    @Get ("/:id")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("user.view")
    @AppApiShowCrudSpecDecorator ("id")
    @ApiBearerAuth ()
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNVERIFIED,
    })
    /**
     * @param {Request} request
     * @param {UserIdentifierDto} parameters
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async show (
        @Req () request: Request,
        @Param () parameters: UserIdentifierDto
    ): Promise<UserTransformerDto | string>
    {
        return await this.userAdminService.get (
            { userId: request["user"].sub, },
            parameters
        );
    }

    @Put ("/:id")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("user.update")
    @UseInterceptors (AvatarInterceptor)
    @AppApiUpdateCrudSpecDecorator ("id", {
        name: "user",
        email: "user@mail.com",
        password: "12345678",
        password_confirmation: "12345678",
    })
    @ApiBearerAuth ()
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNVERIFIED,
    })
    /**
     * @param {Request} request
     * @param {UserIdentifierDto} parameters
     * @param {UserUpdateValidatorDto} inputs
     * @param {Express.Multer.File | undefined} avatar
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async update (
        @Req () request: Request,
        @Param () parameters: UserIdentifierDto,
        @Body () inputs: UserUpdateValidatorDto,
        @UploadedFile () avatar?: Express.Multer.File
    ): Promise<UserTransformerDto | string>
    {
        return await this.userAdminService.update (
            { userId: request["user"].sub, },
            parameters,
            inputs,
            storeAvatar (avatar)
        );
    }

    @Post ("/")
    @HttpCode (Status.CREATED)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("user.create")
    @UseInterceptors (AvatarInterceptor)
    @AppApiStoreCrudSpecDecorator ({
        name: "user",
        email: "user@mail.com",
        password: "12345678",
        password_confirmation: "12345678",
    })
    @ApiBearerAuth ()
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNVERIFIED,
    })
    /**
     * @param {Request} request
     * @param {UserCreateValidatorDto} inputs
     * @param {Express.Multer.File | undefined} avatar
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async store (
        @Req () request: Request,
        @Body () inputs: UserCreateValidatorDto,
        @UploadedFile () avatar?: Express.Multer.File
    ): Promise<UserTransformerDto | string>
    {
        return await this.userAdminService.create (
            { userId: request["user"].sub, },
            inputs,
            storeAvatar (avatar)
        );
    }

    @Delete ("/activate/:id")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("user.restore")
    @AppApiDestroyCrudSpecDecorator ("id")
    @ApiBearerAuth ()
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNVERIFIED,
    })
    /**
     * @param {Request} request
     * @param {UserIdentifierDto} parameters
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async activate (
        @Req () request: Request,
        @Param () parameters: UserIdentifierDto
    ): Promise<UserTransformerDto | string>
    {
        return await this.userAdminService.restore (
            { userId: request["user"].sub, },
            parameters
        );
    }

    @Delete ("/deactivate/:id")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("user.delete")
    @AppApiDestroyCrudSpecDecorator ("id")
    @ApiBearerAuth ()
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNVERIFIED,
    })
    /**
     * @param {Request} request
     * @param {UserIdentifierDto} parameters
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async deactivate (
        @Req () request: Request,
        @Param () parameters: UserIdentifierDto
    ): Promise<UserTransformerDto | string>
    {
        return await this.userAdminService.delete (
            { userId: request["user"].sub, },
            parameters
        );
    }

    @Delete ("/force-delete/:id")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("user.delete")
    @AppApiDestroyCrudSpecDecorator ("id")
    @ApiBearerAuth ()
    /**
     * @param {Request} request
     * @param {UserIdentifierDto} parameters
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async forceDestroy (
        @Req () request: Request,
        @Param () parameters: UserIdentifierDto
    ): Promise<UserTransformerDto | string>
    {
        return await this.userAdminService.forceDelete (
            { userId: request["user"].sub, },
            parameters
        );
    }

    @Put ("/verify/:id")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("user.update")
    @ApiBearerAuth ()
    @ApiParam ({
        name: "id",
        required: true,
        type: String,
        description: "The identifier",
    })
    @ApiResponse ({
        status: Status.OK,
        description: Message.OK,
    })
    @ApiResponse ({
        status: Status.BAD_REQUEST,
        description: Message.UNVALIDATED,
    })
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNVERIFIED,
    })
    /**
     * @param {Request} request
     * @param {UserIdentifierDto} parameters
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async verify (
        @Req () request: Request,
        @Param () parameters: UserIdentifierDto
    ): Promise<UserTransformerDto | string>
    {
        return await this.userAdminService.verify (
            { userId: request["user"].sub, },
            parameters
        );
    }

    @Post ("/import")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("user.import")
    @AppApiFileDecorator ("file", __dirname + "/../../../../../storage/disks/public/import/")
    @ApiBearerAuth ()
    @ApiOperation ({
        description: UserImportDescription,
    })
    @ApiResponse ({
        status: Status.OK,
        description: Message.OK,
    })
    @ApiResponse ({
        status: Status.BAD_REQUEST,
        description: Message.UNVALIDATED,
    })
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNVERIFIED,
    })
    /**
     * @param {Request} request
     * @param {Express.Multer.File} file
     * @returns {Promise<string>}
     */
    public async import (
        @Req () request: Request,
        @AppFileDecorator () file: Express.Multer.File
    ): Promise<string>
    {
        return await this.userAdminService.import (
            { userId: request["user"].sub, },
            file.filename
        );
    }

    @Post ("/export")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UseGuards (UserHttpAuthGuardMiddleware, UserHttpVerificationGuardMiddleware, UserHttpPermissionGuardMiddleware)
    @UserAuthAccessTokenMetadataMiddleware ()
    @UserPermissionMetadataMiddleware ("user.export")
    @ApiQuery ({
        name: "export_type",
        required: false,
        enum: [ "csv", "xls", "xlsx", ],
        description: "File format: csv (default), xlsx, or xls",
        example: "csv",
    })
    @ApiBearerAuth ()
    @ApiOperation ({
        description: UserExportDescription,
    })
    @ApiResponse ({
        status: Status.OK,
        description: Message.OK,
    })
    @ApiResponse ({
        status: Status.UNAUTHORIZED,
        description: Message.UNAUTHORIZED,
    })
    @ApiResponse ({
        status: Status.FORBIDDEN,
        description: Message.UNVERIFIED,
    })
    /**
     * @param {Request} request
     * @param {UserExportTypeDto} query
     * @param {Orderization<UserTransformerDto>[]} orders
     * @param {Filterization<UserTransformerDto>[]} filters
     * @returns {Promise<string>}
     */
    public async export (
        @Req () request: Request,
        @Query () query: UserExportTypeDto,
        @AppOrderQueryStringDecorator ("orders") orders: Orderization<UserTransformerDto>[],
        @AppFilterQueryStringDecorator ("filters") filters: Filterization<UserTransformerDto>[]
    ): Promise<string>
    {
        return await this.userAdminService.export (
            { userId: request["user"].sub, },
            query.export_type || "csv",
            orders,
            filters
        );
    }
}
