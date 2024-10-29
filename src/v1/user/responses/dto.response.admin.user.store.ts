"use strict";

import { Expose, Exclude, } from "class-transformer";
import { CommonResponseDto, } from "src/v1/common/responses/response";

/**
 * @class
 * @extends {CommonResponseDto}
 */
export class StoreUserAdminResponseDto extends CommonResponseDto
{
    @Exclude ()
    /**
     * @type {string}
     */
    public password: string;

    /**
     * @param {Partial<StoreUserAdminResponseDto>} partial
     * @returns {void}
     */
    constructor (
        partial: Partial<StoreUserAdminResponseDto>
    )
    {
        super ();

        Object.assign (this, partial);
    }
};
