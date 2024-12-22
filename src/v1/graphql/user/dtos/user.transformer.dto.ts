import { ObjectType, Field, ID, } from "@nestjs/graphql";

@ObjectType ()
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

    @Field (type => Number, { nullable: true, })
    /**
     * @type {number | null}
     */
    accessTokenTtl: number;

    @Field (type => Number, { nullable: true, })
    /**
     * @type {number | null}
     */
    refreshTokenTtl: number;

    @Field (type => String, { nullable: true, })
    /**
     * @type {string | null}
     */
    accessToken: string;

    @Field (type => String, { nullable: true, })
    /**
     * @type {string | null}
     */
    refreshToken: string;
}

@ObjectType ()
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

    @Field (type => ID)
    /**
     * @type {string}
     */
    id: string;

    @Field (type => String)
    /**
     * @type {string}
     */
    name: string;

    @Field (type => String)
    /**
     * @type {string}
     */
    email: string;

    @Field ({ nullable: true, })
    /**
     * @type {Date | null}
     */
    email_verified_at?: Date;

    @Field ()
    /**
     * @type {Date}
     */
    created_at: Date;

    @Field ()
    /**
     * @type {Date}
     */
    updated_at: Date;

    @Field ({ nullable: true, })
    /**
     * @type {Date | null}
     */
    deleted_at?: Date;
}
