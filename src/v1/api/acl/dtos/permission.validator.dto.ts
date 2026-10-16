import { IsIn, IsOptional, IsString, MaxLength, MinLength, } from "class-validator";

/**
 * @type {string[]}
 */
const GUARD_NAMES = [ "web", "api", ] as const;

/**
 * @class {PermissionCreateValidatorDto}
 */
export class PermissionCreateValidatorDto
{
    @IsString ()
    @MinLength (1)
    @MaxLength (255)
    /**
     * @type {string}
     */
    name: string;

    @IsOptional ()
    @IsIn (GUARD_NAMES)
    /**
     * @type {"web" | "api"}
     */
    guard_name: "web" | "api" = "web";
}

/**
 * @class {PermissionUpdateValidatorDto}
 */
export class PermissionUpdateValidatorDto
{
    @IsOptional ()
    @IsString ()
    @MinLength (1)
    @MaxLength (255)
    /**
     * @type {string}
     */
    name?: string;

    @IsOptional ()
    @IsIn (GUARD_NAMES)
    /**
     * @type {"web" | "api"}
     */
    guard_name?: "web" | "api";
}

/**
 * @class {PermissionIdentifierDto}
 */
export class PermissionIdentifierDto
{
    @IsString ()
    /**
     * @type {string}
     */
    id: string;
}
