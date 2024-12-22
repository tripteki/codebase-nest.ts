"use strict";

/**
 * @interface {Factory}
 * @template {T}
 */
export interface Factory<T>
{
    /**
     * @returns {Promise<T>}
     */
    definition (): Promise<T>;
};
