import { ApiProperty, } from "@nestjs/swagger";

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
 * @class {UserProfileTransformerDto}
 */
export class UserProfileTransformerDto
{
    /**
     * @param {Partial<UserProfileTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<UserProfileTransformerDto>)
    {
        Object.assign (this, partial);
    }

    @ApiProperty ({ type: String, nullable: true, example: "string", })
    /**
     * @type {string | null}
     */
    full_name?: string | null;

    @ApiProperty ({ type: String, nullable: true, example: null, })
    /**
     * @type {string | null}
     */
    avatar?: string | null;

    @ApiProperty ({ type: String, nullable: true, example: null, })
    /**
     * @type {string | null}
     */
    avatar_url?: string | null;

    @ApiProperty ({ type: [String,], example: [], })
    /**
     * @type {string[]}
     */
    interests?: string[];
}

/**
 * @class {UserMeTransformerDto}
 */
export class UserMeTransformerDto
{
    /**
     * @param {Partial<UserMeTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<UserMeTransformerDto>)
    {
        Object.assign (this, partial);
    }

    @ApiProperty ({ type: String, example: "string", })
    /**
     * @type {string}
     */
    id: string;

    @ApiProperty ({ type: String, example: "string", })
    /**
     * @type {string}
     */
    name: string;

    @ApiProperty ({ type: String, example: "user@mail.com", })
    /**
     * @type {string}
     */
    email: string;

    @ApiProperty ({ type: Date, nullable: true, example: null, })
    /**
     * @type {Date | null}
     */
    email_verified_at?: Date | null;

    @ApiProperty ({ type: Date, })
    /**
     * @type {Date}
     */
    created_at: Date;

    @ApiProperty ({ type: Date, })
    /**
     * @type {Date}
     */
    updated_at: Date;

    @ApiProperty ({ type: () => UserProfileTransformerDto, nullable: true, })
    /**
     * @type {UserProfileTransformerDto | null}
     */
    profile?: UserProfileTransformerDto | null;
}

/**
 * @class {UserAccessTransformerDto}
 */
export class UserAccessTransformerDto
{
    /**
     * @param {Partial<UserAccessTransformerDto>} partial
     * @returns {void}
     */
    constructor (partial: Partial<UserAccessTransformerDto>)
    {
        Object.assign (this, partial);
    }

    @ApiProperty ({ type: [String,], example: [], })
    /**
     * @type {string[]}
     */
    permissions: string[];

    @ApiProperty ({ type: [String,], example: [], })
    /**
     * @type {string[]}
     */
    roles: string[];
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
