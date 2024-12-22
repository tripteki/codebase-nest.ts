import { Exclude, } from "class-transformer";

/**
 * @class {UserTransformerDto}
 */
export class UserTransformerDto
{
    /**
     * @param {Partial<UserTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<UserTransformerDto>)
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
    name: string;

    /**
     * @type {string}
     */
    email: string;

    @Exclude ()
    /**
     * @type {string}
     */
    password: string;

    /**
     * @type {Date | null}
     */
    email_verified_at?: Date | null;

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
