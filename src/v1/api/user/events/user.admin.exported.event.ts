/**
 * @class {UserAdminExportedEvent}
 */
export class UserAdminExportedEvent
{
    /**
     * @param {Partial<UserAdminExportedEvent>} partial
     * @returns {void}
     */
    constructor (partial: Partial<UserAdminExportedEvent>)
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
    fileUrl: string;

    /**
     * @type {string}
     */
    filePath: string;
}
