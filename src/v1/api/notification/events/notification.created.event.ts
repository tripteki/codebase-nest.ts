/**
 * @class {NotificationCreatedEvent}
 */
export class NotificationCreatedEvent
{
    /**
     * @param {Partial<NotificationCreatedEvent>} partial
     * @returns {void}
     */
    constructor (partial: Partial<NotificationCreatedEvent>)
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
    notificationId: string;

    /**
     * @type {number}
     */
    unread: number;
}
