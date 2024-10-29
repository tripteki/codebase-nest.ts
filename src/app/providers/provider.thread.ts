"use strict";

import { Logger, } from "@nestjs/common";
import os from "os";
import cluster from "cluster";
import configHelper from "src/app/helpers/helper.config";

/**
 * @class
 */
export class AppThreadProvider
{
    /**
     * @param {() => Promise<void>} fn
     * @returns {Promise<void>}
     */
    public async register (fn: () => Promise<void>): Promise<void>
    {
        const

        appConfig = configHelper ("app");

        if (appConfig.env === "production") {

            if (cluster.isPrimary) {

                Logger.log (`Thread.pid.manager.${process.pid}!`);

                let i: number = 0;

                for (; i < os.cpus ().length; i++) {

                    cluster.fork ();
                }

                cluster.on ("exit", (worker) => {

                    Logger.log (`Thread.pid.worker.${worker.process.pid}!`);

                    cluster.fork ();
                });

            } else {

                Logger.log (`Thread.pid.clustered.${process.pid}!`);

                await fn ();
            }

        } else {

            await fn ();
        }
    }

    /**
     * @returns {Promise<void>}
     */
    public async boot (): Promise<void>
    {
        //
    }
};
