import { Type, Transform, plainToClass, } from "class-transformer";
import { ValidateNested, IsDefined, IsOptional, IsNotEmpty, IsIn, IsArray, IsNumber, IsString, } from "class-validator";

/**
 * @class ValidatorAccessSortableDto
 */
export class ValidatorAccessSortableDto
{
   /**
    * @type {string}
    */
    @IsDefined ()
    @IsString ()
    field: string;

   /**
    * @type {string}
    */
    @IsDefined ()
    @IsString ()
    @IsIn ([ "asc", "desc", ])
    order: string;
}

/**
 * @class ValidatorAccessFilterableDto
 */
export class ValidatorAccessFilterableDto
{
   /**
    * @type {string}
    */
    @IsDefined ()
    @IsString ()
    field: string;

   /**
    * @type {string}
    */
    @IsDefined ()
    @IsString ()
    @IsNotEmpty ()
    search: string;
}

/**
 * @class ValidatorAccessDto
 */
export class ValidatorAccessDto
{
   /**
    * @type {number}
    */
    @IsOptional ()
    @Transform (({ value, }) => (
        typeof value !== "number" ? Number (value) : value)
    )
    @IsNumber ()
    page?: number = 1;

   /**
    * @type {number}
    */
    @IsOptional ()
    @Transform (({ value, }) => (
        typeof value !== "number" ? Number (value) : value)
    )
    @IsNumber ()
    perPage?: number = 10;

   /**
    * @type {ValidatorAccessSortableDto[] | undefined}
    */
    @IsOptional ()
    @IsArray ()
    @ValidateNested ({ each: true, })
    @Transform (
        ({ value, }) => typeof value === "string" ?
        plainToClass (ValidatorAccessSortableDto,
            JSON.parse (value.replace (/(\w+):/g, '"$1":'))) : value
    )
    @Type (() => ValidatorAccessSortableDto)
    sortables?: ValidatorAccessSortableDto[];

   /**
    * @type {ValidatorAccessFilterableDto[] | undefined}
    */
    @IsOptional ()
    @IsArray ()
    @ValidateNested ({ each: true, })
    @Transform (
        ({ value, }) => typeof value === "string" ?
        plainToClass (ValidatorAccessFilterableDto,
            JSON.parse (value.replace (/(\w+):/g, '"$1":'))) : value
    )
    @Type (() => ValidatorAccessFilterableDto)
    filterables?: ValidatorAccessFilterableDto[];
}

/**
 * @class ValidatorMutateDto
 */
export class ValidatorMutateDto
{
    //
}
