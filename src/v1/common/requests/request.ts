"use strict";

import { StandardParams, } from "nest-standard-response";

/**
 * @abstract
 * @class
 */
export abstract class CommonRequestDto
{
    /**
     * @param {StandardParams} params
     * @param {string} message
     * @param {string} sort
     * @param {string} filter
     * @returns {void}
     */
    public static resolve (
        params: StandardParams,
        message: string,
        sort: string = "",
        filter: string = ""): void
    {
        if (message) {
            params.setMessage (message);
        }

        if (! sort) {
            params.sortingInfo.query = undefined;
            params.sortingInfo.sort = undefined;
            params.sortingInfo.sortableFields = undefined;
            params.setSortingInfo (params.sortingInfo);
        }

        if (! filter) {
            params.filteringInfo.query = undefined;
            params.filteringInfo.filter = undefined;
            params.filteringInfo.filterableFields = undefined;
            params.setFilteringInfo (params.filteringInfo);
        }
    }

    /**
     * @param {string} connection
     * @param {Record<string, any>} querystring
     * @returns {Record<string, any>}
     */
    public static resolveQueryPagination (
        connection: string,
        querystring: Record<string, any>): Record<string, any>
    {
        if (connection === "mongo") {

            return {};

        } else if (connection === "postgre") {

            return {

                ... (querystring.limit ? { take: querystring.limit, } : {}),
                ... (querystring.offset ? { skip: querystring.offset, } : {}),
            };
        }
    }

    /**
     * @param {string} connection
     * @param {Record<string, any>} querystring
     * @param {Record<string, string>} prependSort
     * @param {Record<string, string>} appendSort
     * @returns {Record<string, any>}
     */
    public static resolveQuerySort (
        connection: string,
        querystring: Record<string, any>,
        prependSort: Record<string, string> = {},
        appendSort: Record<string, string> = {}): Record<string, any>
    {
        return {

            ... (querystring.sort ? { order: {
                ... prependSort,
                ... querystring.sort.reduce ((record, { field, order, }) => {
                        if (connection === "mongo") {record = record;}
                        else if (connection === "postgre") {record[field] = order.toUpperCase () === "ASC" ? "ASC" : "DESC";}
                        return record;
                    }, {}),
                ... appendSort,
            },
            } : {}),
        };
    }
};
