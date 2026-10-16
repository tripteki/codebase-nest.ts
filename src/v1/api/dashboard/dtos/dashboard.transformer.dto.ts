/**
 * @class {DashboardPeriodDto}
 */
export class DashboardPeriodDto
{
    /**
     * @type {string}
     */
    key: string = "30d";

    /**
     * @type {Date | null}
     */
    date_from?: Date | null;

    /**
     * @type {Date | null}
     */
    date_to?: Date | null;
}

/**
 * @class {DashboardNotificationBriefDto}
 */
export class DashboardNotificationBriefDto
{
    /**
     * @type {string}
     */
    id: string;

    /**
     * @type {string}
     */
    type: string;

    /**
     * @type {string | null}
     */
    title?: string | null;

    /**
     * @type {string | null}
     */
    body?: string | null;

    /**
     * @type {string | null}
     */
    url?: string | null;

    /**
     * @type {Date | null}
     */
    created_at?: Date | null;

    /**
     * @type {Date | null}
     */
    read_at?: Date | null;
}

/**
 * @class {DashboardActivityBriefDto}
 */
export class DashboardActivityBriefDto
{
    /**
     * @type {string}
     */
    id: string;

    /**
     * @type {string}
     */
    description: string;

    /**
     * @type {string | null}
     */
    event?: string | null;

    /**
     * @type {string | null}
     */
    subject_type?: string | null;

    /**
     * @type {string | null}
     */
    subject_id?: string | null;

    /**
     * @type {string | null}
     */
    causer_id?: string | null;

    /**
     * @type {string | null}
     */
    causer_email?: string | null;

    /**
     * @type {Date | null}
     */
    created_at?: Date | null;
}

/**
 * @class {DashboardUsersDto}
 */
export class DashboardUsersDto
{
    /**
     * @type {number}
     */
    total: number = 0;

    /**
     * @type {number}
     */
    active: number = 0;

    /**
     * @type {number}
     */
    deactivated: number = 0;

    /**
     * @type {number}
     */
    unverified: number = 0;

    /**
     * @type {number}
     */
    new_in_period: number = 0;

    /**
     * @type {Record<string, number>}
     */
    by_role: Record<string, number> = {};
}

/**
 * @class {DashboardLinksDto}
 */
export class DashboardLinksDto
{
    /**
     * @type {string}
     */
    users: string = "/admin/users";

    /**
     * @type {string}
     */
    activities: string = "/admin/activities";

    /**
     * @type {string}
     */
    notifications: string = "/notifications";
}

/**
 * @class {DashboardTransformerDto}
 */
export class DashboardTransformerDto
{
    /**
     * @type {string}
     */
    role: string;

    /**
     * @type {DashboardPeriodDto}
     */
    period: DashboardPeriodDto;

    /**
     * @type {DashboardUsersDto | null}
     */
    users?: DashboardUsersDto | null;

    /**
     * @type {DashboardActivityBriefDto[] | null}
     */
    recent_activities?: DashboardActivityBriefDto[] | null;

    /**
     * @type {"all" | "own"}
     */
    activities_scope: "all" | "own" = "all";

    /**
     * @type {DashboardNotificationBriefDto[]}
     */
    recent_notifications: DashboardNotificationBriefDto[] = [];

    /**
     * @type {number}
     */
    unread_notifications: number = 0;

    /**
     * @type {DashboardLinksDto}
     */
    links: DashboardLinksDto = new DashboardLinksDto ();
}
