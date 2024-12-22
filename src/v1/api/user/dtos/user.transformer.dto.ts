/**
 * @class {UserAuthTransformerDto}
 */
export class UserAuthTransformerDto
{
    /**
     * @param {Partial<UserAuthTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<UserAuthTransformerDto>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {number}
     */
    accessTokenTtl: number;

    /**
     * @type {number}
     */
    refreshTokenTtl: number;

    /**
     * @type {string}
     */
    accessToken: string;

    /**
     * @type {string}
     */
    refreshToken: string;
}

/**
 * @class {UserAuthIdentifierTransformerDto}
 */
export class UserAuthIdentifierTransformerDto
{
    /**
     * @param {Partial<UserAuthIdentifierTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<UserAuthIdentifierTransformerDto>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {string}
     */
    userId: string;
}

/**
 * @class {UserAuthIdentifierEmailTransformerDto}
 */
export class UserAuthIdentifierEmailTransformerDto
{
    /**
     * @param {Partial<UserAuthIdentifierEmailTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<UserAuthIdentifierEmailTransformerDto>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {string}
     */
    userEmail: string;
}

/**
 * @class {UserTransformerDto}
 */
export class UserTransformerDto
{
    /**
     * @param {Partial<UserTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<UserTransformerDto>)
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
     * @type {Date | null}
     */
    email_verified_at?: Date | null;

    /**
     * @type {Date}
     */
    created_at: Date;

    /**
     * @type {Date}
     */
    updated_at: Date;

    /**
     * @type {Date | null}
     */
    deleted_at?: Date | null;
}

/**
 * @class {UserResetterTransformerDto}
 */
export class UserResetterTransformerDto
{
    /**
     * @param {Partial<UserResetterTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<UserResetterTransformerDto>)
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
     * @type {UserTransformerDto}
     */
    user: UserTransformerDto;
}
