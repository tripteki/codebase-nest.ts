"use strict";

import { Expose, Exclude, plainToClass, classToPlain, } from "class-transformer";

/**
 * @abstract
 * @class
 */
export abstract class CommonResponseDto
{
    @Exclude ()
    /**
     * @type {Record<string, boolean>}
     */
    private _controls: Record<string, boolean>;

    @Expose ()
    /**
     * @returns {Record<string, boolean>}
     */
    public get controls ()
    {
        return this._controls;
    }

    /**
     * @param {Record<string, boolean>} _controls
     * @returns {void}
     */
    public set controls (_controls)
    {
        this._controls = _controls;
    }

    /**
     * @template T
     * @param {new (...args: any[]) => T} reference
     * @param {Partial<T>} data
     * @param {boolean|null} isViewable
     * @param {boolean|null} isUpdateable
     * @param {boolean|null} isDeleteable
     * @returns {Record<string, any>}
     */
    public static resolve<T> (
        reference: new (...args: any[]) => T,
        data: Partial<T>,
        isViewable: boolean|null = null,
        isUpdateable: boolean|null = null,
        isDeleteable: boolean|null = null): Record<string, any>
    {
        return classToPlain (
            new reference ({
                ... classToPlain (
                        plainToClass (
                            reference,
                            data
                        )
                ),
                controls: {
                    ... (isViewable !== null ? { view: isViewable, } : {}),
                    ... (isUpdateable !== null ? { update: isUpdateable, } : {}),
                    ... (isDeleteable !== null ? { delete: isDeleteable, } : {}),
                },
            })
        );
    }
};
