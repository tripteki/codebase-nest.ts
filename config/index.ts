"use strict";

import app from "./app";
import http from "./http";
import auth from "./auth";
import localization from "./localization";
import logger from "./logger";
import storage from "./filesystem";
import cache from "./cache";
import database from "./db";
import mailer from "./mailer";
import queue from "./queue";

/**
 * List of all configuration modules used in the application.
 * Each of these modules is responsible for configuring and managing a specific
 * service or feature within the application.
 */
export default [

    app,
    http,
    auth,
    localization,
    logger,
    storage,
    cache,
    database,
    mailer,
    queue,

];
