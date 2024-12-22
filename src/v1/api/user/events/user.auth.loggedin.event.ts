/**
 * @class {UserAuthLoggedInEvent}
 */
export class UserAuthLoggedInEvent
{
    /**
     * @param {Partial<UserAuthLoggedInEvent>} partial
     * @returns {void}
     */
    constructor (partial: Partial<UserAuthLoggedInEvent>)
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

    /**
     * @type {string | null}
     */
    password?: string | null;

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
