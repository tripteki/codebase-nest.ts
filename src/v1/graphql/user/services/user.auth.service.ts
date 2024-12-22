import { Injectable, Inject, } from "@nestjs/common";
import { UserAuthService as ApiUserAuthService, } from "src/v1/api/user/services/user.auth.service";

@Injectable ()
/**
 * @class {UserAuthService}
 * @extends {ApiUserAuthService}
 */
export class UserAuthService extends ApiUserAuthService
{
    /**
     * @param {any} request
     * @param {any} response
     * @returns {string | undefined}
     */
    public graphqlBearerToken (request: any): string | undefined
    {
        const [type, token] = request?.headers?.authorization?.split (" ") ?? [];

        return type === "Bearer" ? token : undefined;
    }
}
