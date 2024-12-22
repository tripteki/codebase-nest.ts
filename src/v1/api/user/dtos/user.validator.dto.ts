import { IsDefined, IsOptional, IsNotEmpty, MinLength, MaxLength, IsString, IsEmail, } from "class-validator";

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
}
