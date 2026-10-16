import { Injectable, } from "@nestjs/common";
import { Prisma, } from "@prisma/client";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { AppService, } from "src/app/services/app.service";
import {
    DashboardActivityBriefDto,
    DashboardLinksDto,
    DashboardNotificationBriefDto,
    DashboardPeriodDto,
    DashboardTransformerDto,
    DashboardUsersDto,
} from "src/v1/api/dashboard/dtos/dashboard.transformer.dto";
import { ActivityAdminRepository, } from "src/v1/api/log/repositories/activity.admin.repository";
import { UserRoleEnum, } from "src/v1/api/user/dtos/user.role.enum";
import { UserAclRepository, } from "src/v1/api/user/repositories/user.acl.repository";

/**
 * @type {string}
 */
const USER_MODEL_TYPE = "User";

@Injectable ()
/**
 * @class {DashboardAdminService}
 * @extends {AppService}
 */
export class DashboardAdminService extends AppService
{
    /**
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @param {UserAclRepository} userAclRepository
     * @param {ActivityAdminRepository} activityAdminRepository
     * @returns {void}
     */
    constructor (
        protected readonly prismaPostgreService: DatabasePrismaPostgreDriver,
        protected readonly userAclRepository: UserAclRepository,
        protected readonly activityAdminRepository: ActivityAdminRepository
    )
    {
        super ();
    }

    /**
     * @param {string[]} roles
     * @returns {string}
     */
    protected resolveBucket (roles: string[]): string
    {
        if (roles.includes (UserRoleEnum.Superadmin)) return UserRoleEnum.Superadmin;
        if (roles.includes (UserRoleEnum.Admin)) return UserRoleEnum.Admin;

        return UserRoleEnum.User;
    }

    /**
     * @param {string} period
     * @param {string | undefined} dateFrom
     * @param {string | undefined} dateTo
     * @returns {DashboardPeriodDto}
     */
    protected periodBounds (period: string, dateFrom?: string, dateTo?: string): DashboardPeriodDto
    {
        const now = new Date ();
        let key = (period || "30d").trim ().toLowerCase ();
        let start: Date | null = null;
        let end: Date | null = now;
        const dto = new DashboardPeriodDto ();

        if (key === "today") {
            start = new Date (now);
            start.setUTCHours (0, 0, 0, 0);
        } else if (key === "7d") {
            start = new Date (now.getTime () - (7 * 24 * 60 * 60 * 1000));
        } else if (key === "custom") {
            if (dateFrom) start = new Date (dateFrom);
            if (dateTo) {
                end = new Date (dateTo);
                if ((dateTo || "").trim ().length <= 10) end.setUTCHours (23, 59, 59, 999);
            }
        } else {
            key = "30d";
            start = new Date (now.getTime () - (30 * 24 * 60 * 60 * 1000));
        }

        dto.key = key;
        dto.date_from = start;
        dto.date_to = end;

        return dto;
    }

    /**
     * @param {DashboardPeriodDto} period
     * @returns {Prisma.DateTimeFilter}
     */
    protected createdRange (period: DashboardPeriodDto): Prisma.DateTimeFilter
    {
        const range: Prisma.DateTimeFilter = {};

        if (period.date_from) range.gte = period.date_from;
        if (period.date_to) range.lte = period.date_to;

        return range;
    }

    /**
     * @param {string} userId
     * @param {string} period
     * @param {string | undefined} dateFrom
     * @param {string | undefined} dateTo
     * @returns {Promise<DashboardTransformerDto>}
     */
    public async get (
        userId: string,
        period: string = "30d",
        dateFrom?: string,
        dateTo?: string
    ): Promise<DashboardTransformerDto>
    {
        const accesses = await this.userAclRepository.getUserAccesses (userId);
        const periodDto = this.periodBounds (period, dateFrom, dateTo);
        const isSuperadmin = accesses.roles.includes (UserRoleEnum.Superadmin);
        const ownerId = await this.activityAdminRepository.ownerIdFor (userId);
        const createdAt = this.createdRange (periodDto);
        const dto = new DashboardTransformerDto ();

        const notifications = await this.prismaPostgreService.notification.findMany ({
            where: {
                user_id: userId,
                deleted_at: null,
                created_at: createdAt,
            },
            orderBy: { created_at: "desc", },
            take: 8,
        });

        dto.recent_notifications = notifications.map ((row) => {
            const data = (row.data || {}) as Record<string, unknown>;
            const item = new DashboardNotificationBriefDto ();
            item.id = row.id;
            item.type = row.type;
            item.title = data.title ? String (data.title) : null;
            item.body = data.body ? String (data.body) : (data.message ? String (data.message) : null);
            item.url = data.url ? String (data.url) : null;
            item.created_at = row.created_at;
            item.read_at = row.read_at;

            return item;
        });

        dto.unread_notifications = await this.prismaPostgreService.notification.count ({
            where: { user_id: userId, deleted_at: null, read_at: null, },
        });

        if (isSuperadmin || accesses.permissions.includes ("user.view")) {
            const users = new DashboardUsersDto ();
            users.total = await this.prismaPostgreService.user.count ();
            users.active = await this.prismaPostgreService.user.count ({
                where: { deleted_at: null, email_verified_at: { not: null, }, },
            });
            users.deactivated = await this.prismaPostgreService.user.count ({
                where: { deleted_at: { not: null, }, },
            });
            users.unverified = await this.prismaPostgreService.user.count ({
                where: { deleted_at: null, email_verified_at: null, },
            });
            users.new_in_period = await this.prismaPostgreService.user.count ({
                where: { created_at: createdAt, },
            });

            const roles = await this.prismaPostgreService.role.findMany ({ orderBy: { name: "asc", }, });

            for (const role of roles) {
                users.by_role[role.name] = await this.prismaPostgreService.modelHasRole.count ({
                    where: {
                        role_id: role.id,
                        model_type: USER_MODEL_TYPE,
                        model_id: { in: (await this.prismaPostgreService.user.findMany ({
                            where: { deleted_at: null, },
                            select: { id: true, },
                        })).map ((user) => user.id), },
                    },
                });
            }

            dto.users = users;
        }

        if (isSuperadmin || accesses.permissions.includes ("activity.view")) {
            const rows = await this.prismaPostgreService.activity.findMany ({
                where: {
                    created_at: createdAt,
                    ...(ownerId ? {
                        OR: [
                            { causer_id: ownerId, },
                            { subject_type: "User", subject_id: ownerId, },
                        ],
                    } : {}),
                },
                orderBy: { created_at: "desc", },
                take: 8,
            });
            const causerIds = rows.map ((row) => row.causer_id).filter ((id): id is string => Boolean (id));
            const causers = causerIds.length > 0
                ? await this.prismaPostgreService.user.findMany ({ where: { id: { in: causerIds, }, }, })
                : [];
            const emails = new Map (causers.map ((user) => [ user.id, user.email, ]));

            dto.recent_activities = rows.map ((row) => {
                const item = new DashboardActivityBriefDto ();
                item.id = row.id;
                item.description = row.description;
                item.event = row.event;
                item.subject_type = row.subject_type;
                item.subject_id = row.subject_id;
                item.causer_id = row.causer_id;
                item.causer_email = row.causer_id ? emails.get (row.causer_id) || null : null;
                item.created_at = row.created_at;

                return item;
            });
        }

        dto.role = this.resolveBucket (accesses.roles);
        dto.period = periodDto;
        dto.activities_scope = ownerId ? "own" : "all";
        dto.links = new DashboardLinksDto ();

        return dto;
    }
}
