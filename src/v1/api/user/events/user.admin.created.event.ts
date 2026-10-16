/**
 * @class {UserAdminCreatedEvent}
 */
export class UserAdminCreatedEvent
{
    /**
     * @param {Partial<UserAdminCreatedEvent>} partial
     * @returns {void}
     */
    constructor (partial: Partial<UserAdminCreatedEvent>)
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
     * @type {string}
     */
    roleLabel: string;
}
