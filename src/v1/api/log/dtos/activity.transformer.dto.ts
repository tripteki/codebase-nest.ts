/**
 * @class {ActivityCauserTransformerDto}
 */
export class ActivityCauserTransformerDto
{
    /**
     * @param {Partial<ActivityCauserTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<ActivityCauserTransformerDto>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {string}
     */
    id: string;

    /**
     * @type {string | null}
     */
    full_name?: string | null;

    /**
     * @type {string}
     */
    email: string;
}

/**
 * @class {ActivityTransformerDto}
 */
export class ActivityTransformerDto
{
    /**
     * @param {Partial<ActivityTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<ActivityTransformerDto>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {string}
     */
    id: string;

    /**
     * @type {string | null}
     */
    log_name?: string | null;

    /**
     * @type {string}
     */
    description: string;

    /**
     * @type {string | null}
     */
    subject_type?: string | null;

    /**
     * @type {string | null}
     */
    subject_type_label?: string | null;

    /**
     * @type {string | null}
     */
    subject_id?: string | null;

    /**
     * @type {string | null}
     */
    event?: string | null;

    /**
     * @type {string | null}
     */
    causer_type?: string | null;

    /**
     * @type {string | null}
     */
    causer_id?: string | null;

    /**
     * @type {Record<string, unknown> | null}
     */
    properties?: Record<string, unknown> | null;

    /**
     * @type {string | null}
     */
    batch_uuid?: string | null;

    /**
     * @type {Date}
     */
    created_at: Date;

    /**
     * @type {Date}
     */
    updated_at: Date;

    /**
     * @type {ActivityCauserTransformerDto | null}
     */
    causer?: ActivityCauserTransformerDto | null;
}
