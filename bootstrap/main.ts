"use strict";

import { ApplicationContainer, } from "app/providers/app.container";
import { ApplicationExceptionFilter, } from "app/error/filter";
import { HttpKernel, } from "app/http/kernel";
import { IntentHttpServer, } from "@intentjs/core";

/**
 * @returns {Promise<void>}
 */
(async () =>
{
    // eslint-disable-next-line @typescript-eslint/no-var-requires

    const server: IntentHttpServer = IntentHttpServer.init ();

    server.useContainer (
        ApplicationContainer
    );

    server.useKernel (
        HttpKernel
    );

    server.handleErrorsWith (
        ApplicationExceptionFilter
    );

    server.start ();

}) ();
