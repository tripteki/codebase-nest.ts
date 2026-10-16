import { Request, } from "express";
import { renameSync, } from "fs";
import {
    Controller,
    HttpCode,
    Body,
    Get,
    Put,
    Post,
    Req,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    UnprocessableEntityException,
} from "@nestjs/common";
import { FileInterceptor, } from "@nestjs/platform-express";
import {
    ApiTags,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
} from "@nestjs/swagger";
import { diskStorage, } from "multer";
import { extname, join, } from "path";
import { Throttle as ThrottleMiddleware, ThrottlerGuard as ThrottleGuardMiddleware, } from "@nestjs/throttler";
import { Status, Message, } from "src/app/dtos/app.dto";
import { AppApiStandardResponsesDecorator, } from "src/app/decorators/app.swagger.decorator";
import { assertAvatarUpload, discardUpload, } from "src/app/http/app.upload.guard";
import { UserHttpAuthGuardMiddleware, } from "src/v1/api/user/middlewares/user.auth.guard.middleware";
import { UserAuthAccessTokenMetadataMiddleware, } from "src/v1/api/user/dtos/user.auth.enum";
import { UserProfileService, } from "src/v1/api/user/services/user.profile.service";
import {
    UserAccessTransformerDto,
    UserMeTransformerDto,
} from "src/v1/api/user/dtos/user.transformer.dto";
import { UserMeUpdateValidatorDto, } from "src/v1/api/user/dtos/user.validator.dto";

/**
 * @type {string}
 */
const AVATAR_DESTINATION = join (__dirname, "../../../../../storage/disks/public/avatars/");

/**
 * @type {Record<string, unknown>}
 */
const PROFILE_MULTIPART_BODY = {
    required: true,
    schema: {
        type: "object",
        required: ["name", "email",],
        properties: {
            name: { type: "string", description: "Username", },
            email: { type: "string", format: "email", description: "Email address", },
            full_name: { type: "string", description: "Display name", },
            interests: {
                type: "array",
                items: { type: "string", },
                description: "Profile interests (e.g. interests[0], interests[1])",
            },
            password: { type: "string", description: "New password", },
            password_confirmation: { type: "string", description: "Password confirmation", },
            avatar: { type: "string", format: "binary", description: "Profile image", },
        },
    },
};

/**
 * @param {Record<string, unknown>} body
 * @returns {string[]}
 */
function parseInterests (body: Record<string, unknown>): string[]
{
    const interests: string[] = [];

    for (const [key, value] of Object.entries (body)) {
        if (! /^interests(?:\[\d+\])?$/.test (key)) {
            continue;
        }

        const text = String (value ?? "").trim ();

        if (text) {
            interests.push (text);
        }
    }

    return interests;
}

@ApiTags ("Users")
@Controller ()
/**
 * @class {UserProfileController}
 */
export class UserProfileController
{
    /**
     * @param {UserProfileService} userProfileService
     * @returns {void}
     */
    constructor (
        protected readonly userProfileService: UserProfileService
    )
    {
        //
    }

    @Get ("/v1/users/me")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @UseGuards (UserHttpAuthGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiOperation ({ summary: "Show Current User Profile", })
    @ApiOkResponse ({ type: UserMeTransformerDto, description: Message.OK, })
    @AppApiStandardResponsesDecorator ({ unauthorized: true, forbidden: true, })
    /**
     * @param {Request} request
     * @returns {Promise<UserMeTransformerDto | string>}
     */
    public async showMe (
        @Req () request: Request
    ): Promise<UserMeTransformerDto | string>
    {
        return await this.userProfileService.getMe (request["user"].sub);
    }

    @Put ("/v1/users/me")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @UseGuards (UserHttpAuthGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiOperation ({ summary: "Update Current User Profile", })
    @ApiBody ({ type: UserMeUpdateValidatorDto, })
    @ApiOkResponse ({ type: UserMeTransformerDto, description: Message.OK, })
    @AppApiStandardResponsesDecorator ({ unauthorized: true, forbidden: true, unvalidated: true, })
    /**
     * @param {Request} request
     * @param {UserMeUpdateValidatorDto} inputs
     * @returns {Promise<UserMeTransformerDto | string>}
     */
    public async updateMe (
        @Req () request: Request,
        @Body () inputs: UserMeUpdateValidatorDto
    ): Promise<UserMeTransformerDto | string>
    {
        return await this.userProfileService.updateMe (request["user"].sub, inputs);
    }

    @Post ("/v1/users/me")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @UseGuards (UserHttpAuthGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UserAuthAccessTokenMetadataMiddleware ()
    @UseInterceptors (FileInterceptor ("avatar", {
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
    }))
    @ApiBearerAuth ()
    @ApiOperation ({ summary: "Update Current User Profile (multipart)", })
    @ApiConsumes ("multipart/form-data")
    @ApiBody (PROFILE_MULTIPART_BODY)
    @ApiOkResponse ({ type: UserMeTransformerDto, description: Message.OK, })
    @AppApiStandardResponsesDecorator ({ unauthorized: true, forbidden: true, unvalidated: true, })
    /**
     * @param {Request} request
     * @param {Express.Multer.File | undefined} avatar
     * @returns {Promise<UserMeTransformerDto | string>}
     */
    public async updateMeMultipart (
        @Req () request: Request,
        @UploadedFile () avatar?: Express.Multer.File
    ): Promise<UserMeTransformerDto | string>
    {
        const body = request.body as Record<string, unknown>;
        const missing = [ "name", "email", ].filter ((field) => body[field] === undefined);

        if (missing.length) {
            discardUpload (avatar);
            throw new UnprocessableEntityException ({
                detail: missing.map ((field) => ({ type: "missing", loc: [ "body", field, ], msg: "Field required", input: null, ctx: {}, })),
            });
        }

        const inputs: UserMeUpdateValidatorDto = {
            name: String (body.name ?? ""),
            email: String (body.email ?? ""),
            full_name: body.full_name ? String (body.full_name) : null,
            interests: parseInterests (body),
            password: body.password ? String (body.password) : null,
            password_confirmation: body.password_confirmation
                ? String (body.password_confirmation)
                : null,
        };

        let avatarPath: string | undefined;

        if (avatar) {
            const extension = assertAvatarUpload (avatar);
            const filename = `${Date.now ()}${extension}`;
            renameSync (avatar.path, join (AVATAR_DESTINATION, filename));
            avatarPath = `avatars/${filename}`;
        }

        return await this.userProfileService.updateMe (
            request["user"].sub,
            inputs,
            avatarPath
        );
    }

    @Get ("/v1/users/me/interests")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @UseGuards (UserHttpAuthGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 10, ttl: 60000, }, })
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiOperation ({ summary: "Profile Interest Suggestions", })
    @ApiOkResponse ({
        description: Message.OK,
        schema: {
            properties: {
                data: {
                    type: "array",
                    items: { type: "string", },
                },
            },
        },
    })
    @AppApiStandardResponsesDecorator ({ unauthorized: true, forbidden: true, })
    /**
     * @returns {Promise<{ data: string[] }>}
     */
    public async interests (): Promise<{ data: string[] }>
    {
        return {
            data: await this.userProfileService.profileInterests (),
        };
    }

    @Get ("/v1/users/me/accesses")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @UseGuards (UserHttpAuthGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 180, ttl: 60000, }, })
    @UserAuthAccessTokenMetadataMiddleware ()
    @ApiBearerAuth ()
    @ApiOperation ({ summary: "Current User Accesses", })
    @ApiOkResponse ({ type: UserAccessTransformerDto, description: Message.OK, })
    @AppApiStandardResponsesDecorator ({ unauthorized: true, forbidden: true, })
    /**
     * @param {Request} request
     * @returns {Promise<UserAccessTransformerDto>}
     */
    public async accesses (
        @Req () request: Request
    ): Promise<UserAccessTransformerDto>
    {
        return await this.userProfileService.accesses (request["user"].sub);
    }
}
