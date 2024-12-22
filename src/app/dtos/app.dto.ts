"use strict";

import { HttpStatus, } from "@nestjs/common";

/**
 * @typedef {number} Status
 */
export const Status = HttpStatus;

/**
 * @typedef {string} Message
 */
export enum Message
{
    /**
     * @type {string}
     */
    OK = "Ok",

    /**
     * @type {string}
     */
    CREATED = "Created",

    /**
     * @type {string}
     */
    UNVALIDATED = "Validation Error",

    /**
     * @type {string}
     */
    UNSIGNED = "Not Signed",

    /**
     * @type {string}
     */
    UNAUTHORIZED = "Not Authorized",

    /**
     * @type {string}
     */
    UNVERIFIED = "Not Verified",
};

/**
 * @typedef {Object} BatchPayloadType
 * @property {number} count
 */
export type BatchPayloadType =
{
    /**
     * @type {number}
     */
    count: number;
};
