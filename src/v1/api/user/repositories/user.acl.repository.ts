import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { AppPostgreRepository, } from "src/app/repositories/app.postgre.repository";
import { UserRoleEnum, } from "src/v1/api/user/dtos/user.role.enum";
import { ulid, } from "ulid";

/**
 * @type {string}
 */
const USER_MODEL_TYPE = "User";
/**
 * @type {string}
 */
const GUARD_NAME = "web";

@Injectable ()
/**
 * @class {UserAclRepository}
 * @extends {AppPostgreRepository}
 */
export class UserAclRepository extends AppPostgreRepository
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly prismaPostgreService: DatabasePrismaPostgreDriver
    )
    {
        super (
            configService,
            i18nService,
            prismaPostgreService
        );
    }

    /**
     * @param {string} userId
     * @returns {Promise<{ permissions: string[]; roles: string[] }>}
     */
    public async getUserAccesses (
        userId: string
    ): Promise<{ permissions: string[]; roles: string[] }>
    {
        const roleLinks = await this.prismaPostgreService.modelHasRole.findMany ({
            where: {
                model_id: userId,
                model_type: USER_MODEL_TYPE,
            },
        });

        const roleIds: string[] = roleLinks.map ((link) => link.role_id);

        if (roleIds.length === 0) {
            return { permissions: [], roles: [], };
        }

        const roles = await this.prismaPostgreService.role.findMany ({
            where: { id: { in: roleIds, }, },
        });

        const permissionLinks = await this.prismaPostgreService.roleHasPermission.findMany ({
            where: { role_id: { in: roleIds, }, },
        });

        const permissionIds: string[] = permissionLinks.map ((link) => link.permission_id);

        const permissions = permissionIds.length > 0
            ? await this.prismaPostgreService.permission.findMany ({
                where: { id: { in: permissionIds, }, },
            })
            : [];

        return {
            permissions: Array.from (new Set (permissions.map ((permission) => permission.name))).sort (),
            roles: Array.from (new Set (roles.map ((role) => role.name))).sort (),
        };
    }

    /**
     * @param {string} userId
     * @returns {Promise<string | null>}
     */
    public async getUserRole (
        userId: string
    ): Promise<string | null>
    {
        const accesses = await this.getUserAccesses (userId);

        return accesses.roles[0] ?? null;
    }

    /**
     * @param {string[]} userIds
     * @returns {Promise<Record<string, string>>}
     */
    public async getRolesByUserIds (
        userIds: string[]
    ): Promise<Record<string, string>>
    {
        if (userIds.length === 0) return {};

        const links = await this.prismaPostgreService.modelHasRole.findMany ({
            where: {
                model_id: { in: userIds, },
                model_type: USER_MODEL_TYPE,
            },
            include: { role: true, },
        });

        const roles: Record<string, string> = {};

        for (const link of links) {
            if (! roles[link.model_id]) roles[link.model_id] = link.role.name;
        }

        return roles;
    }

    /**
     * @param {string} userId
     * @param {string} roleName
     * @returns {Promise<void>}
     */
    public async assignSingleRole (
        userId: string,
        roleName: string
    ): Promise<void>
    {
        const role = await this.prismaPostgreService.role.findFirst ({
            where: {
                name: roleName,
                guard_name: GUARD_NAME,
            },
        });

        if (! role) throw new Error (roleName);

        await this.prismaPostgreService.$transaction (async (transaction) => {
            await transaction.modelHasRole.deleteMany ({
                where: {
                    model_id: userId,
                    model_type: USER_MODEL_TYPE,
                    role_id: { not: role.id, },
                },
            });

            await transaction.modelHasRole.upsert ({
                where: {
                    role_id_model_type_model_id: {
                        role_id: role.id,
                        model_type: USER_MODEL_TYPE,
                        model_id: userId,
                    },
                },
                create: {
                    role_id: role.id,
                    model_type: USER_MODEL_TYPE,
                    model_id: userId,
                },
                update: {},
            });
        });
    }

    /**
     * @param {string} userId
     * @param {string} roleName
     * @returns {Promise<string>}
     */
    public async syncUserRole (
        userId: string,
        roleName: string
    ): Promise<string>
    {
        const now = new Date ();
        let role = await this.prismaPostgreService.role.findFirst ({
            where: {
                name: roleName,
                guard_name: GUARD_NAME,
            },
        });

        if (! role) {
            role = await this.prismaPostgreService.role.create ({
                data: {
                    id: ulid (),
                    name: roleName,
                    guard_name: GUARD_NAME,
                    created_at: now,
                    updated_at: now,
                },
            });
        }

        await this.assignSingleRole (userId, role.name);

        return role.name;
    }

    /**
     * @param {string[]} roleNames
     * @returns {Promise<string[]>}
     */
    public async findUserIdsByRoleNames (
        roleNames: string[]
    ): Promise<string[]>
    {
        if (roleNames.length === 0) return [];

        const roles = await this.prismaPostgreService.role.findMany ({
            where: {
                name: { in: roleNames, },
                guard_name: GUARD_NAME,
            },
        });

        if (roles.length === 0) return [];

        const links = await this.prismaPostgreService.modelHasRole.findMany ({
            where: {
                role_id: { in: roles.map ((role) => role.id), },
                model_type: USER_MODEL_TYPE,
            },
        });

        const userIds = Array.from (new Set (links.map ((link) => link.model_id)));

        if (userIds.length === 0) return [];

        const users = await this.prismaPostgreService.user.findMany ({
            where: {
                id: { in: userIds, },
                deleted_at: null,
            },
        });

        return users.map ((user) => user.id).sort ();
    }

    /**
     * @param {string[]} permissionNames
     * @param {string[]} extraRoleNames
     * @returns {Promise<string[]>}
     */
    public async findUserIdsByPermissionNames (
        permissionNames: string[],
        extraRoleNames: string[]
    ): Promise<string[]>
    {
        const roleNames = new Set (extraRoleNames);

        if (permissionNames.length > 0) {
            const links = await this.prismaPostgreService.roleHasPermission.findMany ({
                where: {
                    permission: {
                        name: { in: permissionNames, },
                    },
                    role: {
                        guard_name: GUARD_NAME,
                    },
                },
                include: { role: true, },
            });

            for (const link of links) roleNames.add (link.role.name);
        }

        return this.findUserIdsByRoleNames (Array.from (roleNames).sort ());
    }

    /**
     * @param {string} userId
     * @returns {Promise<void>}
     */
    public async assignDefaultUserRole (
        userId: string
    ): Promise<void>
    {
        try {
            await this.assignSingleRole (userId, UserRoleEnum.User);
        } catch {
            await this.syncUserRole (userId, UserRoleEnum.User);
        }
    }
}
