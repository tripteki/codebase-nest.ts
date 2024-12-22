import { Injectable, Logger as LoggerService, } from "@nestjs/common";
import { Cron, } from "@nestjs/schedule";
import { ConfigService, } from "@nestjs/config";
import { AppService, } from "src/app/services/app.service";

@Injectable ()
/**
 * @class {UserScheduleService}
 * @extends {AppService}
 */
export class UserScheduleService extends AppService
{
    /**
     * @type {LoggerService}
     */
    protected readonly loggerService = new LoggerService (UserScheduleService.name);

    /**
     * @param {ConfigService} configService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService
    )
    {
        super ();
    }

    /**
     * @returns {Promise<void>}
     */
    @Cron ("* * * * *", {
        name: "clean",
    })
    public async handleClean (): Promise<void>
    {
        this.loggerService.log ("Cleaning...");

        try {

            this.loggerService.log ("Cleaned!");

        } catch (error) {

            this.loggerService.error ("Uncleaned:", error);
        }
    }
}
