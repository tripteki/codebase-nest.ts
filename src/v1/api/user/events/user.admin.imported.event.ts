/**
 * @class {UserAdminImportedEvent}
 */
export class UserAdminImportedEvent
{
    /**
     * @param {Partial<UserAdminImportedEvent>} partial
     * @returns {void}
     */
    constructor (partial: Partial<UserAdminImportedEvent>)
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
     * @type {number}
     */
    totalImported: number;

    /**
     * @type {number}
     */
    totalSkipped: number;
}
