"use strict";

import { Module, } from "@nestjs/common";
import { ClusterHubModule, } from "nest-cluster-hub";

@Module ({

    imports: [

        ClusterHubModule.forRoot (),
    ],

    exports: [

        //
    ],
})
/**
 * @class
 */
export class AppThreadModule
{
    //
};
