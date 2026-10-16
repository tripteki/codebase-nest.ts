/**
 * @class {SearchItemTransformerDto}
 */
export class SearchItemTransformerDto
{
    /**
     * @param {Partial<SearchItemTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<SearchItemTransformerDto>)
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
    title: string;

    /**
     * @type {string | null}
     */
    subtitle?: string | null;

    /**
     * @type {string}
     */
    url: string;
}

/**
 * @class {SearchGroupTransformerDto}
 */
export class SearchGroupTransformerDto
{
    /**
     * @param {Partial<SearchGroupTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<SearchGroupTransformerDto>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {string}
     */
    category: string;

    /**
     * @type {SearchItemTransformerDto[]}
     */
    items: SearchItemTransformerDto[] = [];
}

/**
 * @class {SearchTransformerDto}
 */
export class SearchTransformerDto
{
    /**
     * @param {Partial<SearchTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<SearchTransformerDto>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {SearchGroupTransformerDto[]}
     */
    results: SearchGroupTransformerDto[] = [];
}
