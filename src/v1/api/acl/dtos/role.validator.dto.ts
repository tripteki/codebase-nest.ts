import { IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength, } from "class-validator";

/**
 * @type {string[]}
 */
const GUARD_NAMES = [ "web", "api", ] as const;

/**
 * @class {RoleCreateValidatorDto}
 */
export class RoleCreateValidatorDto
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

    @IsOptional ()
    @IsArray ()
    @IsString ({ each: true, })
    /**
     * @type {string[]}
     */
    permission_ids: string[] = [];
}

/**
 * @class {RoleUpdateValidatorDto}
 */
export class RoleUpdateValidatorDto
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

    @IsOptional ()
    @IsArray ()
    @IsString ({ each: true, })
    /**
     * @type {string[]}
     */
    permission_ids?: string[];
}

/**
 * @class {RoleIdentifierDto}
 */
export class RoleIdentifierDto
{
    @IsString ()
    /**
     * @type {string}
     */
    id: string;
}
