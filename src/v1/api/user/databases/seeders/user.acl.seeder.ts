import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { ulid, } from "ulid";

const GUARD_NAME = "web";
const USER_MODEL_TYPE = "User";

const ROLE_PERMISSIONS: Record<string, string[]> = {
    superadmin: [
        "user.view",
        "user.create",
        "user.update",
        "user.delete",
        "user.restore",
        "user.import",
        "user.export",
    ],
    admin: [
        "user.view",
        "user.create",
        "user.update",
        "user.delete",
        "user.restore",
        "user.import",
        "user.export",
    ],
    speaker: ["user.view"],
    delegate: ["user.view"],
    exhibitor: ["user.view"],
    sponsor: ["user.view"],
    visitor: ["user.view"],
};

@Injectable ()
/**
 * @class {UserAclSeeder}
 */
export class UserAclSeeder
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @param {DateTimeHelper} dateTimeHelper
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly prismaPostgreService: DatabasePrismaPostgreDriver,
        private readonly dateTimeHelper: DateTimeHelper
    )
    {
        //
    }

    /**
     * @returns {Promise<void>}
     */
    public async run (): Promise<void>
    {
        const permissionMap = await this.seedPermissions ();
        const roleMap = await this.seedRoles ();
        await this.seedRolePermissions (permissionMap, roleMap);
        await this.assignSuperuserRole (roleMap);
    }

    /**
     * @returns {Promise<Record<string, { id: string; name: string }>>}
     */
    protected async seedPermissions (): Promise<Record<string, { id: string; name: string }>>
    {
        const permissionNames = Array.from (new Set (
            Object.values (ROLE_PERMISSIONS).flat ()
        )).sort ();

        const permissionMap: Record<string, { id: string; name: string }> = {};

        for (const name of permissionNames) {
            const permission = await this.prismaPostgreService.permission.upsert ({
                where: {
                    name_guard_name: {
                        name,
                        guard_name: GUARD_NAME,
                    },
                },
                create: {
                    id: ulid (),
                    name,
                    guard_name: GUARD_NAME,
                    created_at: this.dateTimeHelper.now (),
                    updated_at: this.dateTimeHelper.now (),
                },
                update: {
                    updated_at: this.dateTimeHelper.now (),
                },
            });

            permissionMap[name] = permission;
        }

        return permissionMap;
    }

    /**
     * @returns {Promise<Record<string, { id: string; name: string }>>}
     */
    protected async seedRoles (): Promise<Record<string, { id: string; name: string }>>
    {
        const roleMap: Record<string, { id: string; name: string }> = {};

        for (const name of Object.keys (ROLE_PERMISSIONS)) {
            const role = await this.prismaPostgreService.role.upsert ({
                where: {
                    name_guard_name: {
                        name,
                        guard_name: GUARD_NAME,
                    },
                },
                create: {
                    id: ulid (),
                    name,
                    guard_name: GUARD_NAME,
                    created_at: this.dateTimeHelper.now (),
                    updated_at: this.dateTimeHelper.now (),
                },
                update: {
                    updated_at: this.dateTimeHelper.now (),
                },
            });

            roleMap[name] = role;
        }

        return roleMap;
    }

    /**
     * @param {Record<string, { id: string }>} permissionMap
     * @param {Record<string, { id: string }>} roleMap
     * @returns {Promise<void>}
     */
    protected async seedRolePermissions (
        permissionMap: Record<string, { id: string }>,
        roleMap: Record<string, { id: string }>
    ): Promise<void>
    {
        for (const [roleName, permissionNames] of Object.entries (ROLE_PERMISSIONS)) {
            const role = roleMap[roleName];

            for (const permissionName of permissionNames) {
                const permission = permissionMap[permissionName];

                await this.prismaPostgreService.roleHasPermission.upsert ({
                    where: {
                        permission_id_role_id: {
                            permission_id: permission.id,
                            role_id: role.id,
                        },
                    },
                    create: {
                        permission_id: permission.id,
                        role_id: role.id,
                    },
                    update: {},
                });
            }
        }
    }

    /**
     * @param {Record<string, { id: string }>} roleMap
     * @returns {Promise<void>}
     */
    protected async assignSuperuserRole (
        roleMap: Record<string, { id: string }>
    ): Promise<void>
    {
        const user = await this.prismaPostgreService.user.findFirst ({
            where: {
                name: "superuser",
                deleted_at: null,
            },
        });

        if (! user) {
            return;
        }

        const role = roleMap.superadmin;

        await this.prismaPostgreService.modelHasRole.upsert ({
            where: {
                role_id_model_type_model_id: {
                    role_id: role.id,
                    model_type: USER_MODEL_TYPE,
                    model_id: user.id,
                },
            },
            create: {
                role_id: role.id,
                model_type: USER_MODEL_TYPE,
                model_id: user.id,
            },
            update: {},
        });
    }
}
