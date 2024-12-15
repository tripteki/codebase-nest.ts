import { Controller, Dto, Validate, Req, Res, Request, Response, Param, Get, } from "@intentjs/core";
import { ValidatorAccessDto, } from "src/v1/api/common/validators/validator.dto";
import { UserAdminService, } from "src/v1/api/user/services/user.admin.service";

/**
 * @class UserAdminController
 */
@Controller ("/api/v1/users")
export class UserAdminController
{
    /**
     * @param { UserAdminService } userAdminService
     * @returns { void }
     */
    constructor (
        private readonly userAdminService: UserAdminService
    )
    {
        //
    }

    /**
     * @param { ValidatorAccessDto } request
     * @param { Response } response
     * @returns { Promise<boolean> }
     */
    @Get ("")
    @Validate (ValidatorAccessDto)
    public async index (
        @Dto () request: ValidatorAccessDto,
        @Res () response: Response
    ): Promise<boolean>
    {
        const userAdminService = await this.userAdminService.all (request);

        return await response.status (200).json (
            userAdminService
        );
    }
}
