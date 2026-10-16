import { Injectable, } from "@nestjs/common";
import { UserAuthService as ApiUserAuthService, } from "src/v1/api/user/services/user.auth.service";
import { UserAuthIdentifierTransformerDto, UserTransformerDto, } from "src/v1/api/user/dtos/user.transformer.dto";

@Injectable ()
/**
 * @class {UserAuthService}
 * @extends {ApiUserAuthService}
 */
export class UserAuthService extends ApiUserAuthService
{
    /**
     * @param {any} request
     * @returns {string | undefined}
     */
    public graphqlBearerToken (request: any): string | undefined
    {
        const [type, token] = request?.headers?.authorization?.split (" ") ?? [];

        return type === "Bearer" ? token : undefined;
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async me (
        userId: UserAuthIdentifierTransformerDto
    ): Promise<UserTransformerDto | string>
    {
        const dto = await super.me (userId);

        if (! dto || typeof dto === "string") return dto;

        const fullName = (await this.userAuthRepository.displayName (dto.id, "")).trim ();
        dto.full_name = fullName || null;

        return dto;
    }
}
