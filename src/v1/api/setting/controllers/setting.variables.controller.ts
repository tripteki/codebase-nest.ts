import { Controller, Get, HttpCode, UseGuards, } from "@nestjs/common";
import { Throttle as ThrottleMiddleware, ThrottlerGuard as ThrottleGuardMiddleware, } from "@nestjs/throttler";
import { ApiTags, } from "@nestjs/swagger";
import { Status, } from "src/app/dtos/app.dto";
import { SettingAdminService, } from "src/v1/api/setting/services/setting.admin.service";

@ApiTags ("SettingVariables")
@Controller ("/v1/settings")
/**
 * @class {SettingVariablesController}
 */
export class SettingVariablesController
{
    /**
     * @param {SettingAdminService} settingAdminService
     * @returns {void}
     */
    constructor (
        protected readonly settingAdminService: SettingAdminService
    )
    {
        //
    }

    @Get ("/variables")
    @HttpCode (Status.OK)
    @UseGuards (ThrottleGuardMiddleware)
    @ThrottleMiddleware ({ default: { limit: 30, ttl: 60000, }, })
    /**
     * @returns {Promise<Record<string, string | null>>}
     */
    public async variables (): Promise<Record<string, string | null>>
    {
        return this.settingAdminService.variables ();
    }
}
