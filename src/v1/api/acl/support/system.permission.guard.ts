import { UnprocessableEntityException, } from "@nestjs/common";
import { I18nService, } from "nestjs-i18n";

/**
 * @type {string[]}
 */
const SYSTEM_PERMISSION_NAMES = [
    "user.view",
    "user.create",
    "user.update",
    "user.delete",
    "user.restore",
    "user.import",
    "user.export",
    "role.view",
    "role.create",
    "role.update",
    "role.delete",
    "role.import",
    "role.export",
    "permission.view",
    "permission.create",
    "permission.update",
    "permission.delete",
    "permission.import",
    "permission.export",
    "activity.view",
    "notification.view",
    "notification.delete",
];

/**
 * @param {string} name
 * @returns {boolean}
 */
export function isSystemPermission (name: string): boolean
{
    return SYSTEM_PERMISSION_NAMES.includes (name);
}

/**
 * @param {I18nService} i18nService
 * @param {string} name
 * @returns {void}
 */
export function assertMutablePermission (i18nService: I18nService, name: string): void
{
    if (isSystemPermission (name)) {
        throw new UnprocessableEntityException (i18nService.t ("_v1_acl.permission.system_permission_locked"));
    }
}
