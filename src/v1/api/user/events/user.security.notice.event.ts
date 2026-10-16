/**
 * @class {UserSecurityNoticeEvent}
 */
export class UserSecurityNoticeEvent
{
    /**
     * @param {Partial<UserSecurityNoticeEvent>} partial
     * @returns {void}
     */
    constructor (partial: Partial<UserSecurityNoticeEvent>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {string}
     */
    to: string;

    /**
     * @type {string}
     */
    name: string;

    /**
     * @type {string}
     */
    subject: string;

    /**
     * @type {string}
     */
    line1: string;

    /**
     * @type {string | null}
     */
    line2?: string | null;

    /**
     * @type {string | null}
     */
    link?: string | null;

    /**
     * @type {string | null}
     */
    linkLabel?: string | null;
}
