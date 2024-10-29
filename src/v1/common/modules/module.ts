"use strict";

import { Module, } from "@nestjs/common";
import { StandardResponseModule as RequestResponseModule, } from "nest-standard-response";
import { UserModule, } from "src/v1/user/modules/module.user";
import { CommonIsExistDecoratorValidator, } from "src/v1/common/decorators/validator.isexist";
import { CommonIsNotExistDecoratorValidator, } from "src/v1/common/decorators/validator.isnotexist";

@Module ({

    imports: [

        RequestResponseModule.forRoot (),

        ... [

            UserModule,
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
