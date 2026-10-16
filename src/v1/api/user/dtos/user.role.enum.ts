/**
 * @enum {string}
 */
export enum UserRoleEnum
{
    /**
     * @type {string}
     */
    Superadmin = "superadmin",

    /**
     * @type {string}
     */
    Admin = "admin",

    /**
     * @type {string}
     */
    User = "user",
}

/**
 * @returns {UserRoleEnum[]}
 */
export function userRoleValues (): UserRoleEnum[]
{
    return Object.values (UserRoleEnum);
}

/**
 * @returns {UserRoleEnum[]}
 */
export function userRoleNotify (): UserRoleEnum[]
{
    return [
        UserRoleEnum.Superadmin,
        UserRoleEnum.Admin,
    ];
}

/**
 * @returns {UserRoleEnum[]}
 */
export function userRoleActivityReaders (): UserRoleEnum[]
{
    return userRoleNotify ();
}

/**
 * @returns {UserRoleEnum[]}
 */
export function userRoleSystemSettings (): UserRoleEnum[]
{
    return [
        UserRoleEnum.Superadmin,
    ];
}

/**
 * @returns {UserRoleEnum[]}
 */
export function userRolePrivileged (): UserRoleEnum[]
{
    return userRoleNotify ();
}
