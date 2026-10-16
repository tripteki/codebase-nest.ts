import { UnprocessableEntityException, } from "@nestjs/common";
import { I18nService, } from "nestjs-i18n";
import { userRoleValues, } from "src/v1/api/user/dtos/user.role.enum";

/**
 * @param {string} name
 * @returns {boolean}
 */
export function isSystemRole (name: string): boolean
{
    return userRoleValues ().includes (name as never);
}

/**
 * @param {I18nService} i18nService
 * @param {string} name
 * @returns {void}
 */
export function assertCreatableRoleName (i18nService: I18nService, name: string): void
{
    if (isSystemRole (name)) {
        throw new UnprocessableEntityException (i18nService.t ("_v1_acl.role.system_role_name_reserved"));
    }
}

/**
 * @param {I18nService} i18nService
 * @param {string} name
 * @returns {void}
 */
export function assertMutableRoleName (i18nService: I18nService, name: string): void
{
    if (isSystemRole (name)) {
        throw new UnprocessableEntityException (i18nService.t ("_v1_acl.role.system_role_locked"));
    }
}
