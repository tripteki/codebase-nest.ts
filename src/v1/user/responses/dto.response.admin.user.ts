"use strict";

import { ObjectType, GraphQLISODateTime, Field, ID, } from "@nestjs/graphql";
import { IDField, FilterableField, QueryOptions, PagingStrategies, } from "@nestjs-query/query-graphql";

@ObjectType ("UserAdmin")
@QueryOptions ({ pagingStrategy: PagingStrategies.OFFSET, enableTotalCount: true, })
/**
 * @class
 */
export class UserAdminResponseDto
{
    @IDField (() => ID)
    /**
     * @type {string}
     */
    id: string;

    @FilterableField ()
    /**
     * @type {string}
     */
    name: string;

    @FilterableField ()
    /**
     * @type {string}
     */
    email: string;

    @Field (() => GraphQLISODateTime, { nullable: true, })
    /**
     * @type {Date}
     */
    email_verified_at: Date;

    /**
     * @type {string}
     */
    password: string;

    @Field (() => GraphQLISODateTime)
    /**
     * @type {Date}
     */
    created_at: Date;

    @Field (() => GraphQLISODateTime)
    /**
     * @type {Date}
     */
    updated_at: Date;

    @Field (() => GraphQLISODateTime, { nullable: true, })
    /**
     * @type {Date}
     */
    deleted_at: Date;
};
