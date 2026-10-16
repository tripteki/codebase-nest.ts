import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException, } from "@nestjs/common";
import { InjectQueue, } from "@nestjs/bull";
import { Queue, } from "bull";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { Permission, } from "@prisma/client";
import { AppService, } from "src/app/services/app.service";
import { Filterization, OffsetPagination, OffsetPaginationType, Orderization, } from "src/app/repositories/app.repository";
import { ActivityRecorder, } from "src/v1/api/log/support/activity.recorder";
import { RolePermissionTransformerDto, RoleTransformerDto, } from "src/v1/api/acl/dtos/role.transformer.dto";
import { RoleCreateValidatorDto, RoleUpdateValidatorDto, } from "src/v1/api/acl/dtos/role.validator.dto";
import { PermissionAdminRepository, } from "src/v1/api/acl/repositories/permission.admin.repository";
import { RoleAdminRepository, RoleWithAccess, } from "src/v1/api/acl/repositories/role.admin.repository";
import { assertCreatableRoleName, assertMutableRoleName, isSystemRole, } from "src/v1/api/acl/support/system.role.guard";

@Injectable ()
/**
 * @class {RoleAdminService}
 * @extends {AppService}
 */
export class RoleAdminService extends AppService
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {RoleAdminRepository} roleAdminRepository
     * @param {PermissionAdminRepository} permissionAdminRepository
     * @param {ActivityRecorder} activityRecorder
     * @param {Queue} aclAdminQueue
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly roleAdminRepository: RoleAdminRepository,
        protected readonly permissionAdminRepository: PermissionAdminRepository,
        protected readonly activityRecorder: ActivityRecorder,
        @InjectQueue ("acl-admin-queue") protected readonly aclAdminQueue: Queue
    )
    {
        super ();
    }

    /**
     * @param {RoleWithAccess} role
     * @returns {Promise<RoleTransformerDto>}
     */
    protected async toDto (role: RoleWithAccess): Promise<RoleTransformerDto>
    {
        const activeIds = await this.roleAdminRepository.activeUserIds (role.users.map ((link) => link.model_id));
        const permissions = role.permissions
            .map ((link) => link.permission)
            .sort ((left, right) => left.name.localeCompare (right.name))
            .map ((permission) => new RolePermissionTransformerDto (permission));

        return new RoleTransformerDto ({
            id: role.id,
            name: role.name,
            guard_name: role.guard_name,
            permissions,
            is_protected: isSystemRole (role.name),
            users_count: activeIds.length,
            created_at: role.created_at,
            updated_at: role.updated_at,
        });
    }

    /**
     * @param {string[]} permissionIds
     * @returns {Promise<void>}
     */
    protected async assertPermissionIds (permissionIds: string[]): Promise<void>
    {
        if (! permissionIds?.length) return;

        const found = await this.permissionAdminRepository.findByIds (permissionIds);
        const foundIds = new Set (found.map ((item: Permission) => item.id));

        if (permissionIds.some ((id) => ! foundIds.has (id))) {
            throw new UnprocessableEntityException (this.i18nService.t ("_v1_acl.role.permissions_not_found"));
        }
    }

    /**
     * @param {Orderization<RoleTransformerDto>[]} orders
     * @param {Filterization<RoleTransformerDto>[]} filters
     * @param {OffsetPaginationType} page
     * @returns {Promise<OffsetPagination<RoleTransformerDto>>}
     */
    public async all (
        orders: Orderization<RoleTransformerDto>[],
        filters: Filterization<RoleTransformerDto>[],
        page: OffsetPaginationType
    ): Promise<OffsetPagination<RoleTransformerDto>>
    {
        const result = await this.roleAdminRepository.allOffset (orders as never, filters as never, page);

        return {
            ... result,
            data: await Promise.all (result.data.map ((role) => this.toDto (role))),
        };
    }

    /**
     * @param {string} id
     * @returns {Promise<RoleTransformerDto>}
     */
    public async get (id: string): Promise<RoleTransformerDto>
    {
        const role = await this.roleAdminRepository.findById (id);

        if (! role) throw new NotFoundException (this.i18nService.t ("_v1_acl.role.not_found"));

        return this.toDto (role);
    }

    /**
     * @param {string} causerId
     * @param {RoleCreateValidatorDto} data
     * @returns {Promise<RoleTransformerDto>}
     */
    public async create (causerId: string, data: RoleCreateValidatorDto): Promise<RoleTransformerDto>
    {
        const name = data.name.trim ();
        const guardName = data.guard_name || "web";

        assertCreatableRoleName (this.i18nService, name);

        const existing = await this.roleAdminRepository.findByNameGuard (name, guardName);

        if (existing) throw new BadRequestException (this.i18nService.t ("_v1_acl.role.name_exists"));

        await this.assertPermissionIds (data.permission_ids || []);

        const role = await this.roleAdminRepository.create (name, guardName, data.permission_ids || []);

        await this.activityRecorder.log ("role created", "created", "Role", role.id, causerId, {
            attributes: {
                name: role.name,
                guard_name: role.guard_name,
                permission_ids: data.permission_ids || [],
            },
        });

        return this.get (role.id);
    }

    /**
     * @param {string} causerId
     * @param {string} id
     * @param {RoleUpdateValidatorDto} data
     * @returns {Promise<RoleTransformerDto>}
     */
    public async update (causerId: string, id: string, data: RoleUpdateValidatorDto): Promise<RoleTransformerDto>
    {
        const role = await this.roleAdminRepository.findById (id);

        if (! role) throw new NotFoundException (this.i18nService.t ("_v1_acl.role.not_found"));

        let nextName: string | null = null;
        let nextGuard: string | null = null;

        if (data.name !== undefined) {
            nextName = data.name.trim ();
            if (nextName !== role.name) {
                assertMutableRoleName (this.i18nService, role.name);
                assertCreatableRoleName (this.i18nService, nextName);
            }
        }

        if (data.guard_name !== undefined && data.guard_name !== role.guard_name) {
            assertMutableRoleName (this.i18nService, role.name);
            nextGuard = data.guard_name;
        }

        const checkName = nextName ?? role.name;
        const checkGuard = nextGuard ?? role.guard_name;

        if (checkName !== role.name || checkGuard !== role.guard_name) {
            const existing = await this.roleAdminRepository.findByNameGuard (checkName, checkGuard);

            if (existing && existing.id !== role.id) {
                throw new BadRequestException (this.i18nService.t ("_v1_acl.role.name_exists"));
            }
        }

        if (data.permission_ids) await this.assertPermissionIds (data.permission_ids);

        const updated = await this.roleAdminRepository.update (
            role.id,
            nextName,
            nextGuard,
            data.permission_ids ?? null
        );

        await this.activityRecorder.log ("role updated", "updated", "Role", updated.id, causerId, {
            attributes: {
                name: updated.name,
                guard_name: updated.guard_name,
                permission_ids: data.permission_ids ?? null,
            },
        });

        return this.get (updated.id);
    }

    /**
     * @param {string} causerId
     * @param {string} id
     * @returns {Promise<RoleTransformerDto>}
     */
    public async delete (causerId: string, id: string): Promise<RoleTransformerDto>
    {
        const role = await this.roleAdminRepository.findById (id);

        if (! role) throw new NotFoundException (this.i18nService.t ("_v1_acl.role.not_found"));

        assertMutableRoleName (this.i18nService, role.name);

        const dto = await this.toDto (role);

        if (dto.users_count > 0) {
            throw new UnprocessableEntityException (this.i18nService.t ("_v1_acl.role.in_use", { args: { count: dto.users_count, }, }));
        }

        await this.roleAdminRepository.delete (role.id);
        await this.activityRecorder.log ("role deleted", "deleted", "Role", dto.id, causerId, {
            attributes: { name: dto.name, guard_name: dto.guard_name, },
        });

        return dto;
    }

    /**
     * @param {string} userId
     * @param {string} file
     * @returns {Promise<string>}
     */
    public async import (userId: string, file: string): Promise<string>
    {
        await this.aclAdminQueue.add ("role-import", { userId, file, });

        return this.i18nService.t ("_v1_acl.import.started.message");
    }

    /**
     * @param {string} userId
     * @param {string} type
     * @param {Filterization<RoleTransformerDto>[]} filters
     * @returns {Promise<string>}
     */
    public async export (
        userId: string,
        type: string = "csv",
        filters: Filterization<RoleTransformerDto>[] = []
    ): Promise<string>
    {
        const normalized = [ "csv", "xlsx", ].includes ((type || "csv").toLowerCase ()) ? type.toLowerCase () : "csv";

        await this.aclAdminQueue.add ("role-export", {
            userId,
            type: normalized,
            where: this.roleAdminRepository.filtersToWhere (filters as never),
        });

        return this.i18nService.t ("_v1_acl.export.started.message");
    }
}
