import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, } from "@nestjs/common";
import { Reflector, } from "@nestjs/core";
import { I18nService, } from "nestjs-i18n";
import { UserRoleEnum, } from "src/v1/api/user/dtos/user.role.enum";
import { UserAclRepository, } from "src/v1/api/user/repositories/user.acl.repository";

/**
 * @type {string}
 */
export const USER_PERMISSION_METADATA = "user.permission";

/**
 * @param {string} permission
 * @returns {MethodDecorator}
 */
export const UserPermissionMetadataMiddleware = (permission: string): MethodDecorator => SetMetadata (USER_PERMISSION_METADATA, permission);

@Injectable ()
/**
 * @class {UserHttpPermissionGuardMiddleware}
 * @implements {CanActivate}
 */
export class UserHttpPermissionGuardMiddleware implements CanActivate
{
    /**
     * @param {Reflector} reflector
     * @param {I18nService} i18nService
     * @param {UserAclRepository} userAclRepository
     * @returns {void}
     */
    constructor (
        protected readonly reflector: Reflector,
        protected readonly i18nService: I18nService,
        protected readonly userAclRepository: UserAclRepository
    )
    {
        //
    }

    /**
     * @param {ExecutionContext} context
     * @returns {Promise<boolean>}
     */
    public async canActivate (context: ExecutionContext): Promise<boolean>
    {
        const permission = this.reflector.getAllAndOverride<string> (USER_PERMISSION_METADATA, [
            context.getHandler (),
            context.getClass (),
        ]);

        if (! permission) return true;

        const request = context.switchToHttp ().getRequest ();
        const userId = request["user"]?.sub as string;
        const accesses = await this.userAclRepository.getUserAccesses (userId);

        if (accesses.roles.includes (UserRoleEnum.Superadmin)) return true;
        if (accesses.permissions.includes (permission)) return true;

        throw new ForbiddenException (this.i18nService.t ("_v1_user.auth.forbidden"));
    }
}
