import { UserAuthRegisteredEvent, } from "src/v1/api/user/events/user.auth.registered.event";

/**
 * @class {UserAuthResetEvent}
 */
export class UserAuthResetEvent
{
    /**
     * @param {Partial<UserAuthResetEvent>} partial
     * @returns {void}
     */
    constructor (partial: Partial<UserAuthResetEvent>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {string}
     */
    token: string;

    /**
     * @type {string}
     */
    email: string;

    /**
     * @type {Date}
     */
    created_at: Date;

    /**
     * @type {UserAuthRegisteredEvent}
     */
    user: UserAuthRegisteredEvent;
}
