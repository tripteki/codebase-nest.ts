/**
 * @class {RolePermissionTransformerDto}
 */
export class RolePermissionTransformerDto
{
    /**
     * @param {Partial<RolePermissionTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<RolePermissionTransformerDto>)
    {
        this.id = partial.id;
        this.name = partial.name;
        this.guard_name = partial.guard_name;
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
}

/**
 * @class {RoleTransformerDto}
 */
export class RoleTransformerDto
{
    /**
     * @param {Partial<RoleTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<RoleTransformerDto>)
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
     * @type {RolePermissionTransformerDto[]}
     */
    permissions: RolePermissionTransformerDto[];

    /**
     * @type {boolean}
     */
    is_protected: boolean;

    /**
     * @type {number}
     */
    users_count: number;

    /**
     * @type {Date}
     */
    created_at: Date;

    /**
     * @type {Date}
     */
    updated_at: Date;
}
