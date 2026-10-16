import { Injectable, } from "@nestjs/common";
import { Permission, Prisma, } from "@prisma/client";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { AppPostgreRepository, } from "src/app/repositories/app.postgre.repository";
import { Filterization, OffsetPagination, OffsetPaginationType, Orderization, } from "src/app/repositories/app.repository";
import { ulid, } from "ulid";

@Injectable ()
/**
 * @class {PermissionAdminRepository}
 * @extends {AppPostgreRepository}
 */
export class PermissionAdminRepository extends AppPostgreRepository
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
     * @param {Filterization<Permission>[]} filters
     * @returns {Prisma.PermissionWhereInput}
     */
    protected whereFromFilters (filters: Filterization<Permission>[] = []): Prisma.PermissionWhereInput
    {
        const and: Prisma.PermissionWhereInput[] = [];

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
     * @param {Filterization<Permission>[]} filters
     * @returns {Prisma.PermissionWhereInput}
     */
    public filtersToWhere (filters: Filterization<Permission>[] = []): Prisma.PermissionWhereInput
    {
        return this.whereFromFilters (filters);
    }

    /**
     * @param {Orderization<Permission>[]} orders
     * @param {Filterization<Permission>[]} filters
     * @param {OffsetPaginationType} page
     * @returns {Promise<OffsetPagination<Permission>>}
     */
    public async allOffset (
        orders: Orderization<Permission>[] = [],
        filters: Filterization<Permission>[] = [],
        page: OffsetPaginationType = { currentPage: 1, limitPage: 10, }
    ): Promise<OffsetPagination<Permission>>
    {
        return this.offsetPaginateAll<Permission> ("permission", {
            where: this.whereFromFilters (filters),
            ... this.order (orders?.length ? orders : [ { field: "name", direction: "asc", }, ]),
        }, page);
    }

    /**
     * @param {string} id
     * @returns {Promise<Permission | null>}
     */
    public async findById (id: string): Promise<Permission | null>
    {
        return this.prismaPostgreService.permission.findFirst ({ where: { id, }, });
    }

    /**
     * @param {string} name
     * @param {string} guardName
     * @returns {Promise<Permission | null>}
     */
    public async findByNameGuard (name: string, guardName: string): Promise<Permission | null>
    {
        return this.prismaPostgreService.permission.findFirst ({
            where: { name, guard_name: guardName, },
        });
    }

    /**
     * @param {string[]} ids
     * @returns {Promise<Permission[]>}
     */
    public async findByIds (ids: string[]): Promise<Permission[]>
    {
        if (ids.length === 0) return [];

        return this.prismaPostgreService.permission.findMany ({
            where: { id: { in: ids, }, },
        });
    }

    /**
     * @param {string} name
     * @param {string} guardName
     * @returns {Promise<Permission>}
     */
    public async create (name: string, guardName: string): Promise<Permission>
    {
        const now = this.dateTimeHelper.now ();

        return this.prismaPostgreService.permission.create ({
            data: {
                id: ulid (),
                name,
                guard_name: guardName,
                created_at: now,
                updated_at: now,
            },
        });
    }

    /**
     * @param {string} id
     * @param {string | null} name
     * @param {string | null} guardName
     * @returns {Promise<Permission>}
     */
    public async update (id: string, name: string | null, guardName: string | null): Promise<Permission>
    {
        return this.prismaPostgreService.permission.update ({
            where: { id, },
            data: {
                name: name ?? undefined,
                guard_name: guardName ?? undefined,
                updated_at: this.dateTimeHelper.now (),
            },
        });
    }

    /**
     * @param {string} id
     * @returns {Promise<void>}
     */
    public async delete (id: string): Promise<void>
    {
        await this.prismaPostgreService.permission.delete ({ where: { id, }, });
    }
}
