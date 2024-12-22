import { JsonValue, } from "@prisma/client/runtime/library";
import { UserTransformerDto, } from "src/v1/api/user/dtos/user.transformer.dto";

/**
 * @class {NotificationCountTransformerDto}
 */
export class NotificationCountTransformerDto
{
    /**
     * @param {Partial<NotificationCountTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<NotificationCountTransformerDto>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {number}
     */
    count: number;
}

/**
 * @class {NotificationReadTransformerDto}
 */
export class NotificationReadTransformerDto
{
    /**
     * @param {Partial<NotificationReadTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<NotificationReadTransformerDto>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {number}
     */
    read: number;
}

/**
 * @class {NotificationUnreadTransformerDto}
 */
export class NotificationUnreadTransformerDto
{
    /**
     * @param {Partial<NotificationUnreadTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<NotificationUnreadTransformerDto>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {number}
     */
    unread: number;
}

/**
 * @class {NotificationTransformerDto}
 */
export class NotificationTransformerDto
{
    /**
     * @param {Partial<NotificationTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<NotificationTransformerDto>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {string}
     */
    id: string;

    /**
     * @type {string}
     */
    user_id: string;

    /**
     * @type {string}
     */
    type: string;

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
     * @type {UserTransformerDto | null}
     */
    user?: UserTransformerDto | null;
}
