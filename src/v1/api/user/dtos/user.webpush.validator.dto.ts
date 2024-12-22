import { IsDefined, IsOptional, IsString, ValidateNested, } from "class-validator";
import { Type, } from "class-transformer";
import { ApiProperty, } from "@nestjs/swagger";

/**
 * @class {UserWebpushKeysValidatorDto}
 */
export class UserWebpushKeysValidatorDto
{
    @IsOptional ()
    @IsString ()
    @ApiProperty ({ required: false, })
    /**
     * @type {string | undefined}
     */
    p256dh?: string;

    @IsOptional ()
    @IsString ()
    @ApiProperty ({ required: false, })
    /**
     * @type {string | undefined}
     */
    auth?: string;
}

/**
 * @class {UserWebpushSubscribeValidatorDto}
 */
export class UserWebpushSubscribeValidatorDto
{
    @IsDefined ()
    @IsString ()
    @ApiProperty ()
    /**
     * @type {string}
     */
    endpoint: string;

    @IsOptional ()
    @ValidateNested ()
    @Type (() => UserWebpushKeysValidatorDto)
    @ApiProperty ({ required: false, type: UserWebpushKeysValidatorDto, })
    /**
     * @type {UserWebpushKeysValidatorDto | undefined}
     */
    keys?: UserWebpushKeysValidatorDto;

    @IsOptional ()
    @IsString ()
    @ApiProperty ({ required: false, })
    /**
     * @type {string | undefined}
     */
    content_encoding?: string;
}

/**
 * @class {UserWebpushUnsubscribeValidatorDto}
 */
export class UserWebpushUnsubscribeValidatorDto
{
    @IsDefined ()
    @IsString ()
    @ApiProperty ()
    /**
     * @type {string}
     */
    endpoint: string;
}

/**
 * @class {UserWebpushSuccessTransformerDto}
 */
export class UserWebpushSuccessTransformerDto
{
    @ApiProperty ({ example: true, })
    /**
     * @type {boolean}
     */
    success: boolean;
}
