"use strict";

import { Module, } from "@nestjs/common";
import { TerminusModule, } from "@nestjs/terminus";

@Module ({

    imports: [

        TerminusModule.forRoot ({

            logger: true,
        }),
    ],

    exports: [

        TerminusModule,
    ],
})
/**
 * @class
 */
export class AppHealthModule
{
    //
};
