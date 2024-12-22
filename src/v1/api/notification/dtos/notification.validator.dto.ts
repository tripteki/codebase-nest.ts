import { IsDefined, IsOptional, IsNotEmpty, IsString, IsJSON, } from "class-validator";
import { JsonValue, } from "@prisma/client/runtime/library";
import { Prisma as DatabasePrismaPostgreConstraint, } from "@prisma/client";

/**
 * @class {NotificationIdentifierDto}
 */
export class NotificationIdentifierDto
{
    @IsDefined ()
    @IsString ()
    /**
     * @type {string}
     */
    id: string;
}

/**
 * @class {NotificationUpdateValidatorDto}
 */
export class NotificationUpdateValidatorDto
{
    @IsOptional ()
    @IsNotEmpty ()
    @IsString ()
    /**
     * @type {string}
     */
    type: string;

    @IsOptional ()
    @IsNotEmpty ()
    @IsJSON ()
    /**
     * @type {JsonValue}
     */
    data: JsonValue;
}

/**
 * @class {NotificationCreateValidatorDto}
 */
export class NotificationCreateValidatorDto
{
    /**
     * @type {string}
     */
    id: string;

    @IsDefined ()
    @IsString ()
    /**
     * @type {string}
     */
    user_id: string;

    @IsDefined ()
    @IsString ()
    /**
     * @type {string}
     */
    type: string;

    @IsDefined ()
    @IsJSON ()
    /**
     * @type {JsonValue}
     */
    data: JsonValue;

    /**
     * @type {Date | null}
     */
    read_at?: Date | null;

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

    /**
     * @type {DatabasePrismaPostgreConstraint.UserCreateNestedOneWithoutNotificationsInput}
     */
    user: DatabasePrismaPostgreConstraint.UserCreateNestedOneWithoutNotificationsInput;
}
