"use strict";

import { INestApplication, } from "@nestjs/common";

/**
 * @interface {AppProviderContract}
 */
export interface AppProviderContract
{
    /**
     * @param {(() => INestApplication | Promise<INestApplication>)} app
     * @returns {void | Promise<void>}
     */
    register (app: (() => INestApplication | Promise<INestApplication>)): void | Promise<void>;

    /**
     * @param {INestApplication} app
     * @returns {void | Promise<void>}
     */
    boot (app: INestApplication): void | Promise<void>;
};
