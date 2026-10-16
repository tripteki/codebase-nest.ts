import { BadRequestException, Injectable, NotFoundException, } from "@nestjs/common";
import { InjectQueue, } from "@nestjs/bull";
import { Queue, } from "bull";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { Permission, } from "@prisma/client";
import { AppService, } from "src/app/services/app.service";
import { Filterization, OffsetPagination, OffsetPaginationType, Orderization, } from "src/app/repositories/app.repository";
import { ActivityRecorder, } from "src/v1/api/log/support/activity.recorder";
import { PermissionTransformerDto, } from "src/v1/api/acl/dtos/permission.transformer.dto";
import { PermissionCreateValidatorDto, PermissionUpdateValidatorDto, } from "src/v1/api/acl/dtos/permission.validator.dto";
import { PermissionAdminRepository, } from "src/v1/api/acl/repositories/permission.admin.repository";
import { assertMutablePermission, isSystemPermission, } from "src/v1/api/acl/support/system.permission.guard";

@Injectable ()
/**
 * @class {PermissionAdminService}
 * @extends {AppService}
 */
export class PermissionAdminService extends AppService
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {PermissionAdminRepository} permissionAdminRepository
     * @param {ActivityRecorder} activityRecorder
     * @param {Queue} aclAdminQueue
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly permissionAdminRepository: PermissionAdminRepository,
        protected readonly activityRecorder: ActivityRecorder,
        @InjectQueue ("acl-admin-queue") protected readonly aclAdminQueue: Queue
    )
    {
        super ();
    }

    /**
     * @param {Permission} permission
     * @returns {PermissionTransformerDto}
     */
    protected toDto (permission: Permission): PermissionTransformerDto
    {
        return new PermissionTransformerDto ({
            id: permission.id,
            name: permission.name,
            guard_name: permission.guard_name,
            is_protected: isSystemPermission (permission.name),
            created_at: permission.created_at,
            updated_at: permission.updated_at,
        });
    }

    /**
     * @param {Orderization<PermissionTransformerDto>[]} orders
     * @param {Filterization<PermissionTransformerDto>[]} filters
     * @param {OffsetPaginationType} page
     * @returns {Promise<OffsetPagination<PermissionTransformerDto>>}
     */
    public async all (
        orders: Orderization<PermissionTransformerDto>[],
        filters: Filterization<PermissionTransformerDto>[],
        page: OffsetPaginationType
    ): Promise<OffsetPagination<PermissionTransformerDto>>
    {
        const result = await this.permissionAdminRepository.allOffset (orders as never, filters as never, page);

        return {
            ... result,
            data: result.data.map ((permission) => this.toDto (permission)),
        };
    }

    /**
     * @param {string} id
     * @returns {Promise<PermissionTransformerDto>}
     */
    public async get (id: string): Promise<PermissionTransformerDto>
    {
        const permission = await this.permissionAdminRepository.findById (id);

        if (! permission) throw new NotFoundException (this.i18nService.t ("_v1_acl.permission.not_found"));

        return this.toDto (permission);
    }

    /**
     * @param {string} causerId
     * @param {PermissionCreateValidatorDto} data
     * @returns {Promise<PermissionTransformerDto>}
     */
    public async create (causerId: string, data: PermissionCreateValidatorDto): Promise<PermissionTransformerDto>
    {
        const name = data.name.trim ();
        const guardName = data.guard_name || "web";

        assertMutablePermission (this.i18nService, name);

        const existing = await this.permissionAdminRepository.findByNameGuard (name, guardName);

        if (existing) throw new BadRequestException (this.i18nService.t ("_v1_acl.permission.name_exists"));

        const permission = await this.permissionAdminRepository.create (name, guardName);

        await this.activityRecorder.log ("permission created", "created", "Permission", permission.id, causerId, {
            attributes: { name: permission.name, guard_name: permission.guard_name, },
        });

        return this.toDto (permission);
    }

    /**
     * @param {string} causerId
     * @param {string} id
     * @param {PermissionUpdateValidatorDto} data
     * @returns {Promise<PermissionTransformerDto>}
     */
    public async update (causerId: string, id: string, data: PermissionUpdateValidatorDto): Promise<PermissionTransformerDto>
    {
        const permission = await this.permissionAdminRepository.findById (id);

        if (! permission) throw new NotFoundException (this.i18nService.t ("_v1_acl.permission.not_found"));

        assertMutablePermission (this.i18nService, permission.name);

        const nextName = data.name !== undefined ? data.name.trim () : null;

        const checkName = nextName ?? permission.name;
        const checkGuard = data.guard_name ?? permission.guard_name;

        if (checkName !== permission.name || checkGuard !== permission.guard_name) {
            const existing = await this.permissionAdminRepository.findByNameGuard (checkName, checkGuard);

            if (existing && existing.id !== permission.id) {
                throw new BadRequestException (this.i18nService.t ("_v1_acl.permission.name_exists"));
            }
        }

        if (nextName) assertMutablePermission (this.i18nService, nextName);

        const updated = await this.permissionAdminRepository.update (permission.id, nextName, data.guard_name ?? null);

        await this.activityRecorder.log ("permission updated", "updated", "Permission", updated.id, causerId, {
            attributes: { name: updated.name, guard_name: updated.guard_name, },
        });

        return this.toDto (updated);
    }

    /**
     * @param {string} causerId
     * @param {string} id
     * @returns {Promise<PermissionTransformerDto>}
     */
    public async delete (causerId: string, id: string): Promise<PermissionTransformerDto>
    {
        const permission = await this.permissionAdminRepository.findById (id);

        if (! permission) throw new NotFoundException (this.i18nService.t ("_v1_acl.permission.not_found"));

        assertMutablePermission (this.i18nService, permission.name);

        const dto = this.toDto (permission);

        await this.permissionAdminRepository.delete (permission.id);
        await this.activityRecorder.log ("permission deleted", "deleted", "Permission", dto.id, causerId, {
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
        await this.aclAdminQueue.add ("permission-import", { userId, file, });

        return this.i18nService.t ("_v1_acl.import.started.message");
    }

    /**
     * @param {string} userId
     * @param {string} type
     * @param {Filterization<PermissionTransformerDto>[]} filters
     * @returns {Promise<string>}
     */
    public async export (
        userId: string,
        type: string = "csv",
        filters: Filterization<PermissionTransformerDto>[] = []
    ): Promise<string>
    {
        const normalized = [ "csv", "xlsx", ].includes ((type || "csv").toLowerCase ()) ? type.toLowerCase () : "csv";

        await this.aclAdminQueue.add ("permission-export", {
            userId,
            type: normalized,
            where: this.permissionAdminRepository.filtersToWhere (filters as never),
        });

        return this.i18nService.t ("_v1_acl.export.started.message");
    }
}
