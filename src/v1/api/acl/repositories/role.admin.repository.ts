import { Injectable, } from "@nestjs/common";
import { Prisma, Role, } from "@prisma/client";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { AppPostgreRepository, } from "src/app/repositories/app.postgre.repository";
import { Filterization, OffsetPagination, OffsetPaginationType, Orderization, } from "src/app/repositories/app.repository";
import { ulid, } from "ulid";

/**
 * @type {string}
 */
const USER_MODEL_TYPE = "User";

/**
 * @typedef {object} RoleWithAccess
 */
export type RoleWithAccess = Role & {
    permissions: Array<{ permission: { id: string; name: string; guard_name: string; }; }>;
    users: Array<{ model_id: string; }>;
};

@Injectable ()
/**
 * @class {RoleAdminRepository}
 * @extends {AppPostgreRepository}
 */
export class RoleAdminRepository extends AppPostgreRepository
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
        protected readonly dateTimeHelper: DateTimeHelper
    )
    {
        super (configService, i18nService, prismaPostgreService);
    }

    /**
     * @param {Filterization<Role>[]} filters
     * @returns {Prisma.RoleWhereInput}
     */
    protected whereFromFilters (filters: Filterization<Role>[] = []): Prisma.RoleWhereInput
    {
        const and: Prisma.RoleWhereInput[] = [];

        for (const filter of filters || []) {
            if (! filter?.search) continue;

            if (String (filter.field) === "q") {
                and.push ({
                    OR: [
                        { name: { contains: filter.search, mode: "insensitive", }, },
                        { guard_name: { contains: filter.search, mode: "insensitive", }, },
                    ],
                });
                continue;
            }

            if (filter.field === "name" || filter.field === "guard_name") {
                and.push ({ [filter.field]: { contains: filter.search, mode: "insensitive", }, });
            }
        }

        return and.length > 0 ? { AND: and, } : {};
    }

    /**
     * @param {Filterization<Role>[]} filters
     * @returns {Prisma.RoleWhereInput}
     */
    public filtersToWhere (filters: Filterization<Role>[] = []): Prisma.RoleWhereInput
    {
        return this.whereFromFilters (filters);
    }

    /**
     * @param {Orderization<Role>[]} orders
     * @param {Filterization<Role>[]} filters
     * @param {OffsetPaginationType} page
     * @returns {Promise<OffsetPagination<RoleWithAccess>>}
     */
    public async allOffset (
        orders: Orderization<Role>[] = [],
        filters: Filterization<Role>[] = [],
        page: OffsetPaginationType = { currentPage: 1, limitPage: 10, }
    ): Promise<OffsetPagination<RoleWithAccess>>
    {
        return this.offsetPaginateAll<RoleWithAccess> ("role", {
            where: this.whereFromFilters (filters),
            include: {
                permissions: { include: { permission: true, }, },
                users: true,
            },
            ... this.order (orders?.length ? orders : [ { field: "name", direction: "asc", }, ]),
        }, page);
    }

    /**
     * @param {string} id
     * @returns {Promise<RoleWithAccess | null>}
     */
    public async findById (id: string): Promise<RoleWithAccess | null>
    {
        return this.prismaPostgreService.role.findFirst ({
            where: { id, },
            include: {
                permissions: { include: { permission: true, }, },
                users: true,
            },
        });
    }

    /**
     * @param {string} name
     * @param {string} guardName
     * @returns {Promise<Role | null>}
     */
    public async findByNameGuard (name: string, guardName: string): Promise<Role | null>
    {
        return this.prismaPostgreService.role.findFirst ({
            where: { name, guard_name: guardName, },
        });
    }

    /**
     * @param {string[]} modelIds
     * @returns {Promise<string[]>}
     */
    public async activeUserIds (modelIds: string[]): Promise<string[]>
    {
        if (modelIds.length === 0) return [];

        const users = await this.prismaPostgreService.user.findMany ({
            where: { id: { in: modelIds, }, deleted_at: null, },
            select: { id: true, },
        });

        return users.map ((user) => user.id);
    }

    /**
     * @param {string} name
     * @param {string} guardName
     * @param {string[]} permissionIds
     * @returns {Promise<Role>}
     */
    public async create (name: string, guardName: string, permissionIds: string[]): Promise<Role>
    {
        const now = this.dateTimeHelper.now ();

        return this.prismaPostgreService.role.create ({
            data: {
                id: ulid (),
                name,
                guard_name: guardName,
                created_at: now,
                updated_at: now,
                permissions: {
                    create: permissionIds.map ((permissionId) => ({ permission_id: permissionId, })),
                },
            },
        });
    }

    /**
     * @param {string} id
     * @param {string | null} name
     * @param {string | null} guardName
     * @param {string[] | null} permissionIds
     * @returns {Promise<Role>}
     */
    public async update (
        id: string,
        name: string | null,
        guardName: string | null,
        permissionIds: string[] | null
    ): Promise<Role>
    {
        const now = this.dateTimeHelper.now ();

        return this.prismaPostgreService.$transaction (async (transaction) => {
            if (permissionIds) {
                await transaction.roleHasPermission.deleteMany ({ where: { role_id: id, }, });
                if (permissionIds.length > 0) {
                    await transaction.roleHasPermission.createMany ({
                        data: permissionIds.map ((permissionId) => ({
                            role_id: id,
                            permission_id: permissionId,
                        })),
                    });
                }
            }

            return transaction.role.update ({
                where: { id, },
                data: {
                    name: name ?? undefined,
                    guard_name: guardName ?? undefined,
                    updated_at: now,
                },
            });
        });
    }

    /**
     * @param {string} id
     * @returns {Promise<void>}
     */
    public async delete (id: string): Promise<void>
    {
        await this.prismaPostgreService.role.delete ({ where: { id, }, });
    }

    /**
     * @returns {string}
     */
    public userModelType (): string
    {
        return USER_MODEL_TYPE;
    }
}
