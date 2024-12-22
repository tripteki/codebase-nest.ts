/**
 * @class {UserAdminImportedFailedEvent}
 */
export class UserAdminImportedFailedEvent
{
    /**
     * @param {Partial<UserAdminImportedFailedEvent>} partial
     * @returns {void}
     */
    constructor (partial: Partial<UserAdminImportedFailedEvent>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {string}
     */
    userId: string;

    /**
     * @type {string}
     */
    filename: string;

    /**
     * @type {string}
     */
    error: string;
}
