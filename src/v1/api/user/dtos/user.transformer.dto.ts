import { Exclude, } from "class-transformer";

/**
 * @class {AuthTransformerDto}
 */
export class AuthTransformerDto
{
    /**
     * @param {Partial<AuthTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<AuthTransformerDto>)
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
 * @class {AuthIdentifierTransformerDto}
 */
export class AuthIdentifierTransformerDto
{
    /**
     * @param {Partial<AuthIdentifierTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<AuthIdentifierTransformerDto>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {string}
     */
    userId: string;
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

    @Exclude ()
    /**
     * @type {string}
     */
    password: string;

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
