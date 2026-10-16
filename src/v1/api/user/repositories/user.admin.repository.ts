import { Injectable, } from "@nestjs/common";
import { Prisma as DatabasePrismaPostgreConstraint, User, } from "@prisma/client";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { OffsetPaginationType, CursorPaginationType, OffsetPagination, CursorPagination, Orderization, Filterization, } from "src/app/repositories/app.repository";
import { AppPostgreRepository, } from "src/app/repositories/app.postgre.repository";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { HasherHelper, } from "src/app/helpers/hasher.helper";
import { ulid, } from "ulid";

@Injectable ()
/**
 * @class {UserAdminRepository}
 * @extends {AppPostgreRepository}
 */
export class UserAdminRepository extends AppPostgreRepository
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @param {DateTimeHelper} dateTimeHelper
     * @param {HasherHelper} hasherHelper
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly prismaPostgreService: DatabasePrismaPostgreDriver,
        private readonly dateTimeHelper: DateTimeHelper,
        private readonly hasherHelper: HasherHelper
    )
    {
        super (
            configService,
            i18nService,
            prismaPostgreService
        );
    }

    /**
     * @param {Filterization<User>[]} filters
     * @returns {Promise<DatabasePrismaPostgreConstraint.UserWhereInput>}
     */
    private async userListWhere (
        filters: Filterization<User>[] = []
    ): Promise<DatabasePrismaPostgreConstraint.UserWhereInput>
    {
        const filterMap: Record<string, string> = {};

        for (const item of filters || []) {
            const field = String (item.field || "").trim ();
            const search = String (item.search || "").trim ();

            if (field && search) {
                filterMap[field] = search;
            }
        }

        const status = filterMap.status || "active";
        const where: DatabasePrismaPostgreConstraint.UserWhereInput = status === "deactivated"
            ? { deleted_at: { not: null, }, }
            : status === "unverified"
                ? { deleted_at: null, email_verified_at: null, }
                : status === "active"
                    ? { deleted_at: null, email_verified_at: { not: null, }, }
                    : {};
        const q = filterMap.q || filterMap.search;

        if (q) {
            where.OR = [
                { email: { contains: q, mode: "insensitive", }, },
                { name: { contains: q, mode: "insensitive", }, },
                { profile: { is: { full_name: { contains: q, mode: "insensitive", }, }, }, },
            ];
        }

        if (filterMap.role) {
            const links = await this.prismaPostgreService.modelHasRole.findMany ({
                where: {
                    model_type: "User",
                    role: {
                        name: filterMap.role,
                        guard_name: "web",
                    },
                },
                select: { model_id: true, },
            });

            where.id = { in: links.map ((link) => link.model_id), };
        }

        return where;
    }

    /**
     * @param {string} userId
     * @param {string | null} fullName
     * @param {string | null} avatarPath
     * @returns {Promise<void>}
     */
    public async upsertDisplay (
        userId: string,
        fullName?: string | null,
        avatarPath?: string | null
    ): Promise<void>
    {
        const now = this.dateTimeHelper.now ();
        const existing = await this.prismaPostgreService.profile.findUnique ({
            where: { user_id: userId, },
        });

        if (! existing) {
            await this.prismaPostgreService.profile.create ({
                data: {
                    id: ulid (),
                    user_id: userId,
                    full_name: fullName ?? null,
                    avatar: avatarPath ?? null,
                    interests: [],
                    created_at: now,
                    updated_at: now,
                },
            });

            return;
        }

        await this.prismaPostgreService.profile.update ({
            where: { user_id: userId, },
            data: {
                ...(fullName !== undefined ? { full_name: fullName, } : {}),
                ...(avatarPath ? { avatar: avatarPath, } : {}),
                updated_at: now,
            },
        });
    }

    /**
     * @param {string} userId
     * @returns {Promise<{ full_name: string | null; avatar: string | null } | null>}
     */
    public async findProfile (
        userId: string
    ): Promise<{ full_name: string | null; avatar: string | null } | null>
    {
        return this.prismaPostgreService.profile.findUnique ({
            where: { user_id: userId, },
            select: { full_name: true, avatar: true, },
        });
    }

    /**
     * Account status is derived, matching FastAPI: active, then unverified, then deactivated.
     *
     * @param {Orderization<User>[]} orders
     * @returns {{ orderBy: DatabasePrismaPostgreConstraint.UserOrderByWithRelationInput[]; }}
     */
    private userListOrder (
        orders: Orderization<User>[] = []
    ): {
        orderBy: DatabasePrismaPostgreConstraint.UserOrderByWithRelationInput[];
    }
    {
        const sortable = [ "email", "name", "created_at", "updated_at", ];
        const source = orders.length ? orders : [
            { field: "created_at", direction: "desc", } as Orderization<User>,
        ];
        const orderBy: DatabasePrismaPostgreConstraint.UserOrderByWithRelationInput[] = [];

        for (const order of source) {
            const field = String (order.field || "");
            const direction = order.direction === "desc" ? "desc" : "asc";

            if (field === "status") {
                orderBy.push (
                    direction === "asc"
                        ? { deleted_at: { sort: "asc", nulls: "first", }, }
                        : { deleted_at: { sort: "desc", nulls: "last", }, },
                    direction === "asc"
                        ? { email_verified_at: { sort: "desc", nulls: "last", }, }
                        : { email_verified_at: { sort: "asc", nulls: "first", }, }
                );

                continue;
            }

            if (sortable.includes (field)) {
                orderBy.push ({ [field]: direction, });
            }
        }

        return {
            orderBy: orderBy.length ? orderBy : [ { created_at: "desc", }, ],
        };
    }

    /**
     * @param {Filterization<User>[]} filters
     * @param {Orderization<User>[]} orders
     * @returns {Promise<DatabasePrismaPostgreConstraint.UserGetPayload<{ include: { profile: true } }>[]>}
     */
    public async exportRows (
        filters: Filterization<User>[] = [],
        orders: Orderization<User>[] = []
    ): Promise<DatabasePrismaPostgreConstraint.UserGetPayload<{ include: { profile: true } }>[]>
    {
        return this.prismaPostgreService.user.findMany ({
            where: await this.userListWhere (filters),
            include: { profile: true, },
            ... this.userListOrder (orders),
        });
    }

    /**
     * @param {string} userId
     * @param {Orderization<User>[]} orders
     * @param {Filterization<User>[]} filters
     * @param {OffsetPaginationType} page
     * @returns {Promise<OffsetPagination<User>>}
     */
    public async allOffset (
        userId: string,
        orders: Orderization<User>[] = [],
        filters: Filterization<User>[] = [],
        page: OffsetPaginationType = { currentPage: 1, limitPage: 10, }
    ): Promise<OffsetPagination<User>>
    {
        return this.offsetPaginateAll<User> ("user", {
            where: await this.userListWhere (filters),
            include: { profile: true, },
            ... this.userListOrder (orders),
        }, page);
    }

    /**
     * @param {string} userId
     * @param {Orderization<User>[]} orders
     * @param {Filterization<User>[]} filters
     * @param {CursorPaginationType} page
     * @returns {Promise<CursorPagination<User>>}
     */
    public async allCursor (
        userId: string,
        orders: Orderization<User>[] = [],
        filters: Filterization<User>[] = [],
        page: CursorPaginationType = { limitPage: 10, }
    ): Promise<CursorPagination<User>>
    {
        page.cursorField = "id";

        return this.cursorPaginateAll<User> ("user", {
            where: await this.userListWhere (filters),
            ... this.userListOrder (orders),
        }, page);
    }

    /**
     * @param {string} userId
     * @param {string} id
     * @returns {Promise<User | null>}
     */
    public async get (
        userId: string,
        id: string
    ): Promise<User | null>
    {
        return this.accessGet<User> (async (): Promise<User | null> => {
            return await this.prismaPostgreService.user.findFirstOrThrow ({
                where: {
                    ... this.softDelete (),
                    id,
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @param {string} id
     * @param {DatabasePrismaPostgreConstraint.UserUpdateInput} data
     * @returns {Promise<User | null>}
     */
    public async update (
        userId: string,
        id: string,
        data: DatabasePrismaPostgreConstraint.UserUpdateInput
    ): Promise<User | null>
    {
        return this.mutate<User> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<User | null> => {
            const next: DatabasePrismaPostgreConstraint.UserUpdateInput = {
                updated_at: this.dateTimeHelper.now (),
            };

            if (data.name) next.name = data.name;
            if (data.email) next.email = data.email;
            if (data.password) next.password = await this.hasherHelper.hash (String (data.password));

            return await transaction.user.update ({
                where: {
                    ... this.softDelete (),
                    id,
                },
                data: next,
            });
        });
    }

    /**
     * @param {string} userId
     * @param {DatabasePrismaPostgreConstraint.UserCreateInput} data
     * @returns {Promise<User | null>}
     */
    public async create (
        userId: string,
        data: DatabasePrismaPostgreConstraint.UserCreateInput
    ): Promise<User | null>
    {
        return this.mutate<User> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<User | null> => {
            return await transaction.user.create ({
                data: {
                    id: ulid (),
                    name: data.name,
                    email: data.email,
                    password: await this.hasherHelper.hash (data.password as string),
                    email_verified_at: this.dateTimeHelper.now (),
                    created_at: this.dateTimeHelper.now (),
                    updated_at: this.dateTimeHelper.now (),
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @param {string} id
     * @returns {Promise<User | null>}
     */
    public async restore (
        userId: string,
        id: string
    ): Promise<User | null>
    {
        return this.mutate<User> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<User | null> => {
            return await transaction.user.update ({
                where: {
                    deleted_at: { not: null, },
                    id,
                },
                data: {
                    deleted_at: null,
                    updated_at: this.dateTimeHelper.now (),
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @param {string} id
     * @returns {Promise<User | null>}
     */
    public async delete (
        userId: string,
        id: string
    ): Promise<User | null>
    {
        return this.mutate<User> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<User | null> => {
            return await transaction.user.update ({
                where: {
                    ... this.softDelete (),
                    id,
                },
                data: {
                    deleted_at: this.dateTimeHelper.now (),
                    updated_at: this.dateTimeHelper.now (),
                },
            });
        });
    }

    /**
     * @param {string} userId
     * @param {string} id
     * @returns {Promise<User | null>}
     */
    public async verify (
        userId: string,
        id: string
    ): Promise<User | null>
    {
        return this.mutate<User> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<User | null> => {
            return await transaction.user.update ({
                where: {
                    ... this.softDelete (),
                    email_verified_at: null,
                    id,
                },
                data: {
                    email_verified_at: this.dateTimeHelper.now (),
                },
            });
        });
    }

    /**
     * @param {string} id
     * @returns {Promise<User | null>}
     */
    public async findIncludingDeleted (id: string): Promise<User | null>
    {
        return await this.prismaPostgreService.user.findFirst ({ where: { id, }, });
    }

    /**
     * @param {string} id
     * @returns {Promise<User | null>}
     */
    public async forceDelete (id: string): Promise<User | null>
    {
        return this.mutate<User> (async (transaction: DatabasePrismaPostgreConstraint.TransactionClient): Promise<User | null> => {
            const user = await transaction.user.findFirst ({ where: { id, }, });

            if (! user) return null;

            await transaction.notification.deleteMany ({ where: { user_id: id, }, });
            await transaction.pushSubscription.deleteMany ({ where: { subscribable_id: id, }, });
            await transaction.resetter.deleteMany ({ where: { email: user.email, }, });
            await transaction.modelHasRole.deleteMany ({ where: { model_id: id, model_type: "User", }, });
            await transaction.profile.deleteMany ({ where: { user_id: id, }, });
            await transaction.user.delete ({ where: { id, }, });

            return user;
        });
    }
}
