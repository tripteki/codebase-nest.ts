import { IsArray, IsIn, IsOptional, IsString, MaxLength, ValidateNested, } from "class-validator";
import { Type, } from "class-transformer";

/**
 * @class {SettingRowValidatorDto}
 */
export class SettingRowValidatorDto
{
    @IsOptional ()
    @IsString ()
    /**
     * @type {string}
     */
    id?: string;

    @IsOptional ()
    @IsString ()
    @MaxLength (255)
    /**
     * @type {string}
     */
    key?: string;

    @IsOptional ()
    @IsString ()
    /**
     * @type {string}
     */
    value?: string;

    @IsOptional ()
    @IsIn ([ "text", "file", ])
    /**
     * @type {"text" | "file"}
     */
    value_kind: "text" | "file" = "text";
}

/**
 * @class {SettingBatchValidatorDto}
 */
export class SettingBatchValidatorDto
{
    @IsArray ()
    @ValidateNested ({ each: true, })
    @Type (() => SettingRowValidatorDto)
    /**
     * @type {SettingRowValidatorDto[]}
     */
    rows: SettingRowValidatorDto[] = [];
}
