import { JsonValue, } from "@prisma/client/runtime/library";
import { UserTransformerDto, } from "src/v1/api/user/dtos/user.transformer.dto";

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
