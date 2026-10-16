import { Injectable, } from "@nestjs/common";
import { AppService, } from "src/app/services/app.service";
import { PermissionAdminService, } from "src/v1/api/acl/services/permission.admin.service";
import { RoleAdminService, } from "src/v1/api/acl/services/role.admin.service";
import { ActivityAdminService, } from "src/v1/api/log/services/activity.admin.service";
import { SearchGroupTransformerDto, SearchItemTransformerDto, SearchTransformerDto, } from "src/v1/api/search/dtos/search.transformer.dto";
import { UserRoleEnum, } from "src/v1/api/user/dtos/user.role.enum";
import { UserAclRepository, } from "src/v1/api/user/repositories/user.acl.repository";
import { UserAdminService, } from "src/v1/api/user/services/user.admin.service";

/**
 * @type {number}
 */
const SEARCH_MIN_CHARS = 2;
/**
 * @type {number}
 */
const SEARCH_LIMIT = 5;

@Injectable ()
/**
 * @class {SearchAdminService}
 * @extends {AppService}
 */
export class SearchAdminService extends AppService
{
    /**
     * @param {UserAclRepository} userAclRepository
     * @param {UserAdminService} userAdminService
     * @param {RoleAdminService} roleAdminService
     * @param {PermissionAdminService} permissionAdminService
     * @param {ActivityAdminService} activityAdminService
     * @returns {void}
     */
    constructor (
        protected readonly userAclRepository: UserAclRepository,
        protected readonly userAdminService: UserAdminService,
        protected readonly roleAdminService: RoleAdminService,
        protected readonly permissionAdminService: PermissionAdminService,
        protected readonly activityAdminService: ActivityAdminService
    )
    {
        super ();
    }

    /**
     * @param {string} userId
     * @param {string | undefined} query
     * @param {string | undefined} category
     * @returns {Promise<SearchTransformerDto>}
     */
    public async search (userId: string, query?: string, category?: string): Promise<SearchTransformerDto>
    {
        const term = (query || "").trim ();
        const selected = (category || "all").trim () || "all";

        if (term.length < SEARCH_MIN_CHARS) return new SearchTransformerDto ({ results: [], });

        const accesses = await this.userAclRepository.getUserAccesses (userId);
        const isSuperadmin = accesses.roles.includes (UserRoleEnum.Superadmin);
        const page = { currentPage: 1, limitPage: SEARCH_LIMIT, };
        const filters = [ { field: "q", search: term, }, ];
        const groups: Array<[string, string, () => Promise<SearchItemTransformerDto[]>]> = [
            [ "users", "user.view", async () => {
                const result = await this.userAdminService.all ({ userId, }, [], [ { field: "q", search: term, }, { field: "status", search: "all", }, ] as never, page);
                return result.data.map ((user) => {
                    const title = (user.full_name || user.name || "").trim () || user.email;

                    return new SearchItemTransformerDto ({
                        id: user.id,
                        title,
                        subtitle: user.email && user.email !== title ? user.email : null,
                        url: `/admin/users/${user.id}`,
                    });
                });
            }, ],
            [ "roles", "role.view", async () => {
                const result = await this.roleAdminService.all ([], filters as never, page);
                return result.data.map ((role) => new SearchItemTransformerDto ({
                    id: role.id,
                    title: role.name,
                    subtitle: role.guard_name,
                    url: `/admin/roles/${role.id}`,
                }));
            }, ],
            [ "permissions", "permission.view", async () => {
                const result = await this.permissionAdminService.all ([], filters as never, page);
                return result.data.map ((permission) => new SearchItemTransformerDto ({
                    id: permission.id,
                    title: permission.name,
                    subtitle: permission.guard_name,
                    url: `/admin/permissions/${permission.id}`,
                }));
            }, ],
            [ "activities", "activity.view", async () => {
                const result = await this.activityAdminService.all (userId, [], filters as never, page);
                return result.data.map ((activity) => new SearchItemTransformerDto ({
                    id: activity.id,
                    title: activity.description,
                    subtitle: activity.event || null,
                    url: `/admin/activities/${activity.id}`,
                }));
            }, ],
        ];

        const results: SearchGroupTransformerDto[] = [];

        for (const [ key, permission, fetcher, ] of groups) {
            if (selected !== "all" && selected !== key) continue;
            if (! isSuperadmin && ! accesses.permissions.includes (permission)) continue;

            const items = await fetcher ();

            if (items.length > 0) {
                results.push (new SearchGroupTransformerDto ({ category: key, items, }));
            }
        }

        return new SearchTransformerDto ({ results, });
    }
}
