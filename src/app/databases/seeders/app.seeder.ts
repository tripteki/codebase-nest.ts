"use strict";

/**
 * @interface {Seeder}
 */
export interface Seeder
{
    /**
     * @returns {Promise<void>}
     */
    run (): Promise<void>;
};
