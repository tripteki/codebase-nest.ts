import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { AppPostgreRepository, } from "src/app/repositories/app.postgre.repository";

const USER_MODEL_TYPE = "User";

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
}
