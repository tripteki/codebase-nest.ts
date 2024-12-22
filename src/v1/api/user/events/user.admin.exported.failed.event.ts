/**
 * @class {UserAdminExportedFailedEvent}
 */
export class UserAdminExportedFailedEvent
{
    /**
     * @param {Partial<UserAdminExportedFailedEvent>} partial
     * @returns {void}
     */
    constructor (partial: Partial<UserAdminExportedFailedEvent>)
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
    error: string;
}
