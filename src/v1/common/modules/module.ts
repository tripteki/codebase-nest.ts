"use strict";

import { Module, } from "@nestjs/common";
import { CommonIsExistDecoratorValidator, } from "src/v1/common/decorators/validator.isexist";
import { CommonIsNotExistDecoratorValidator, } from "src/v1/common/decorators/validator.isnotexist";

@Module ({

    imports: [

        ... [

            //
        ],
    ],

    providers: [

        CommonIsExistDecoratorValidator,
        CommonIsNotExistDecoratorValidator,
    ],
})
/**
 * @class
 */
export class CommonModule
{
    //
};
