"use strict";

import { Module, } from "@nestjs/common";
import { EventEmitterModule as EventListenerModule, } from "@nestjs/event-emitter";

@Module ({

    imports: [

        EventListenerModule.forRoot ({

            //
        }),
    ],

    exports: [

        //
    ],
})
/**
 * @class
 */
export class AppEventListenerModule
{
    //
};
