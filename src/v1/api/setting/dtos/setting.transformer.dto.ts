/**
 * @class {SettingTransformerDto}
 */
export class SettingTransformerDto
{
    /**
     * @param {Partial<SettingTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<SettingTransformerDto>)
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
    key: string;

    /**
     * @type {string | null}
     */
    value?: string | null;

    /**
     * @type {string}
     */
    value_kind: string;

    /**
     * @type {string | null}
     */
    value_url?: string | null;

    /**
     * @type {Date}
     */
    created_at: Date;

    /**
     * @type {Date}
     */
    updated_at: Date;
}
