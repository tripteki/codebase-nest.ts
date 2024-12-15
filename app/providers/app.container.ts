"use strict";

import {

    IntentProvidersFactory,
    IntentAppContainer,

} from "@intentjs/core";

import config from "config";

import { AppServiceProvider, } from "./app.provider";
import { ConsoleServiceProvider, } from "./console.provider";
import { HttpServiceProvider, } from "./http.provider";
import { UserServiceProvider, } from "src/v1/api/user/providers/user.provider";

export class ApplicationContainer extends IntentAppContainer
{
    /**
     * @returns { void }
     */
    public build (): void
    {
        this.add (IntentProvidersFactory (config));
        this.add (AppServiceProvider);
        this.add (ConsoleServiceProvider);
        this.add (HttpServiceProvider);
        this.add (UserServiceProvider);
    }
};
