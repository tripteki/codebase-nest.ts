import { ObjectType, Field, } from "@nestjs/graphql";

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

    @Field (type => Number)
    /**
     * @type {number}
     */
    accessTokenTtl: number;

    @Field (type => Number)
    /**
     * @type {number}
     */
    refreshTokenTtl: number;

    @Field (type => String)
    /**
     * @type {string}
     */
    accessToken: string;

    @Field (type => String)
    /**
     * @type {string}
     */
    refreshToken: string;
}
