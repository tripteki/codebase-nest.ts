import { Injectable, } from "@nestjs/common";
import { Prisma, } from "@prisma/client";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { AppPostgreRepository, } from "src/app/repositories/app.postgre.repository";
import { Filterization, OffsetPagination, OffsetPaginationType, Orderization, } from "src/app/repositories/app.repository";
import { userRoleActivityReaders, } from "src/v1/api/user/dtos/user.role.enum";
import { UserAclRepository, } from "src/v1/api/user/repositories/user.acl.repository";

/**
 * @type {Record<string, string>}
 */
const SUBJECT_TYPE_ALIASES: Record<string, string> = {
    user: "User",
    role: "Role",
    permission: "Permission",
    setting: "Setting",
};

@Injectable ()
/**
 * @class {ActivityAdminRepository}
 * @extends {AppPostgreRepository}
 */
export class ActivityAdminRepository extends AppPostgreRepository
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @param {UserAclRepository} userAclRepository
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly prismaPostgreService: DatabasePrismaPostgreDriver,
        protected readonly userAclRepository: UserAclRepository
    )
    {
        super (configService, i18nService, prismaPostgreService);
    }

    /**
     * @param {string} userId
     * @returns {Promise<string | null>}
     */
    public async ownerIdFor (userId: string): Promise<string | null>
    {
        const accesses = await this.userAclRepository.getUserAccesses (userId);
        const readers = userRoleActivityReaders ();

        if (accesses.roles.some ((role) => readers.includes (role as never))) return null;

        return userId;
    }

    /**
     * @param {string | null} ownerId
     * @param {Filterization<unknown>[]} filters
     * @returns {Prisma.ActivityWhereInput}
     */
    protected whereFrom (
        ownerId: string | null,
        filters: Filterization<unknown>[] = []
    ): Prisma.ActivityWhereInput
    {
        const and: Prisma.ActivityWhereInput[] = [];

        if (ownerId) {
            and.push ({
                OR: [
                    { causer_id: ownerId, },
                    { subject_type: "User", subject_id: ownerId, },
                ],
            });
        }

        for (const filter of filters || []) {
            if (! filter?.search) continue;

            if (String (filter.field) === "q") {
                and.push ({
                    OR: [
                        { description: { contains: filter.search, mode: "insensitive", }, },
                        { event: { contains: filter.search, mode: "insensitive", }, },
                        { log_name: { contains: filter.search, mode: "insensitive", }, },
                    ],
                });
                continue;
            }

            if (filter.field === "subject_type") {
                const alias = SUBJECT_TYPE_ALIASES[filter.search.toLowerCase ()] || filter.search;
                and.push ({ subject_type: alias, });
            }
        }

        return and.length > 0 ? { AND: and, } : {};
    }

    /**
     * @param {string} userId
     * @param {Orderization<unknown>[]} orders
     * @param {Filterization<unknown>[]} filters
     * @param {OffsetPaginationType} page
     * @returns {Promise<OffsetPagination<Prisma.ActivityGetPayload<{}>>>}
     */
    public async allOffset (
        userId: string,
        orders: Orderization<unknown>[] = [],
        filters: Filterization<unknown>[] = [],
        page: OffsetPaginationType = { currentPage: 1, limitPage: 10, }
    )
    {
        const ownerId = await this.ownerIdFor (userId);

        return this.offsetPaginateAll ("activity", {
            where: this.whereFrom (ownerId, filters),
            ... this.order ((orders?.length ? orders : [ { field: "created_at", direction: "desc", }, ]) as Orderization<unknown>[]),
        }, page);
    }

    /**
     * @param {string} userId
     * @param {string} id
     * @returns {Promise<Prisma.ActivityGetPayload<{}> | null>}
     */
    public async findById (userId: string, id: string)
    {
        const ownerId = await this.ownerIdFor (userId);

        return this.prismaPostgreService.activity.findFirst ({
            where: {
                id,
                ... this.whereFrom (ownerId),
            },
        });
    }
}
