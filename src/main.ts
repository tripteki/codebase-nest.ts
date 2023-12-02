"use strict";

import { NestFactory, } from "@nestjs/core";
import { AppModule, } from "./app.module";

(async () =>
{
    const initialization = await NestFactory.
    create (AppModule);

    await initialization.
    listen (3000);
}) ();
