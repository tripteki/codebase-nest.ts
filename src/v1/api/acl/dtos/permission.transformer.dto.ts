/**
 * @class {PermissionTransformerDto}
 */
export class PermissionTransformerDto
{
    /**
     * @param {Partial<PermissionTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<PermissionTransformerDto>)
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
    guard_name: string;

    /**
     * @type {boolean}
     */
    is_protected: boolean;

    /**
     * @type {Date}
     */
    created_at: Date;

    /**
     * @type {Date}
     */
    updated_at: Date;
}
