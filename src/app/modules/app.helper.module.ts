"use strict";

import { Module, Global, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { ConfigService, } from "@nestjs/config";
import { UrlHelper, } from "src/app/helpers/url.helper";
import { HasherHelper, } from "src/app/helpers/hasher.helper";
import { FakerHelper, } from "src/app/helpers/faker.helper";
import { StringHelper, } from "src/app/helpers/string.helper";
import { CollectionHelper, } from "src/app/helpers/collection.helper";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";

@Global ()
@Module ({

    imports: [

        //
    ],

    exports: [

        UrlHelper,
        HasherHelper,
        FakerHelper,
        StringHelper,
        CollectionHelper,
        DateTimeHelper,
    ],

    providers: [

        ConfigService,
        UrlHelper,
        HasherHelper,
        FakerHelper,
        StringHelper,
        CollectionHelper,
        DateTimeHelper,
    ],
})
/**
 * @class {AppHelperModule}
 */
export class AppHelperModule
{
    //
};
