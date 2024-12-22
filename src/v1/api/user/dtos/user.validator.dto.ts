import { IsDefined, IsOptional, IsNotEmpty, MinLength, MaxLength, IsIn, IsString, IsEmail, } from "class-validator";

/**
 * @class {UserAuthDto}
 */
export class UserAuthDto
{
    @IsDefined ()
    @IsIn ([ "email", "name", ])
    /**
     * @type {string}
     */
    identifierKey: string;

    @IsDefined ()
    @IsString ()
    /**
     * @type {string}
     */
    identifierValue: string;

    @IsDefined ()
    @IsString ()
    /**
     * @type {string}
     */
    password: string;
}

/**
 * @class {UserIdentifierDto}
 */
export class UserIdentifierDto
{
    @IsDefined ()
    @IsString ()
    /**
     * @type {string}
     */
    id: string;
}

/**
 * @class {UserIdentifierEmailDto}
 */
export class UserIdentifierEmailDto
{
    @IsDefined ()
    @IsString ()
    @IsEmail ()
    /**
     * @type {string}
     */
    email: string;
}

/**
 * @class {UserUpdateValidatorDto}
 */
export class UserUpdateValidatorDto
{
    @IsOptional ()
    @IsNotEmpty ()
    @IsString ()
    @MinLength (2)
    @MaxLength (16)
    /**
     * @type {string}
     */
    name: string;

    @IsOptional ()
    @IsNotEmpty ()
    @IsString ()
    @MinLength (8)
    @MaxLength (48)
    @IsEmail ()
    /**
     * @type {string}
     */
    email: string;

    @IsOptional ()
    @IsString ()
    @MinLength (8)
    @MaxLength (16)
    /**
     * @type {string}
     */
    password: string;

    /**
     * @type {string}
     */
    password_confirmation: string;
}

/**
 * @class {UserCreateValidatorDto}
 */
export class UserCreateValidatorDto
{
    /**
     * @type {string}
     */
    id: string;

    @IsDefined ()
    @IsString ()
    @MinLength (2)
    @MaxLength (16)
    /**
     * @type {string}
     */
    name: string;

    @IsDefined ()
    @IsString ()
    @IsEmail ()
    @MinLength (8)
    @MaxLength (48)
    /**
     * @type {string}
     */
    email: string;

    @IsDefined ()
    @IsString ()
    @MinLength (8)
    @MaxLength (16)
    /**
     * @type {string}
     */
    password: string;

    /**
     * @type {string}
     */
    password_confirmation: string;

    /**
     * @type {Date}
     */
    created_at: Date;

    /**
     * @type {Date}
     */
    updated_at: Date;

    /**
     * @type {Date | null}
     */
    deleted_at?: Date | null;
}

/**
 * @class {UserResetterUpdateValidatorDto}
 */
export class UserResetterUpdateValidatorDto
{
    /**
     * @type {string | null}
     */
    token?: string | null;

    /**
     * @type {string | null}
     */
    email?: string | null;

    @IsDefined ()
    @IsString ()
    @MinLength (8)
    @MaxLength (16)
    /**
     * @type {string}
     */
    password: string;

    /**
     * @type {string}
     */
    password_confirmation: string;
}

/**
 * @class {UserExportTypeDto}
 */
export class UserExportTypeDto
{
    @IsOptional ()
    @IsIn ([ "csv", "xls", "xlsx", ])
    /**
     * @type {string}
     */
    type?: string;
}
