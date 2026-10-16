import { Injectable, NotFoundException, } from "@nestjs/common";
import { I18nService, } from "nestjs-i18n";
import { AppService, } from "src/app/services/app.service";
import { Filterization, OffsetPagination, OffsetPaginationType, Orderization, } from "src/app/repositories/app.repository";
import { ActivityCauserTransformerDto, ActivityTransformerDto, } from "src/v1/api/log/dtos/activity.transformer.dto";
import { ActivityAdminRepository, } from "src/v1/api/log/repositories/activity.admin.repository";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";

@Injectable ()
/**
 * @class {ActivityAdminService}
 * @extends {AppService}
 */
export class ActivityAdminService extends AppService
{
    /**
     * @param {I18nService} i18nService
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @param {ActivityAdminRepository} activityAdminRepository
     * @returns {void}
     */
    constructor (
        protected readonly i18nService: I18nService,
        protected readonly prismaPostgreService: DatabasePrismaPostgreDriver,
        protected readonly activityAdminRepository: ActivityAdminRepository
    )
    {
        super ();
    }

    /**
     * @param {Record<string, any>} activity
     * @param {boolean} withDetails
     * @returns {Promise<ActivityTransformerDto>}
     */
    protected async toDto (activity: Record<string, any>, withDetails: boolean): Promise<ActivityTransformerDto>
    {
        let causer: ActivityCauserTransformerDto | null = null;

        if (activity.causer_id) {
            const user = await this.prismaPostgreService.user.findFirst ({
                where: { id: activity.causer_id, },
                include: { profile: true, },
            });

            if (user) {
                causer = new ActivityCauserTransformerDto ({
                    id: user.id,
                    full_name: user.profile?.full_name || null,
                    email: user.email,
                });
            }
        }

        return new ActivityTransformerDto ({
            id: activity.id,
            log_name: activity.log_name,
            description: activity.description,
            subject_type: activity.subject_type,
            subject_type_label: activity.subject_type,
            subject_id: activity.subject_id,
            event: activity.event,
            causer_type: activity.causer_type,
            causer_id: activity.causer_id,
            properties: withDetails ? activity.properties : null,
            batch_uuid: activity.batch_uuid,
            created_at: activity.created_at,
            updated_at: activity.updated_at,
            causer,
        });
    }

    /**
     * @param {string} userId
     * @param {Orderization<ActivityTransformerDto>[]} orders
     * @param {Filterization<ActivityTransformerDto>[]} filters
     * @param {OffsetPaginationType} page
     * @returns {Promise<OffsetPagination<ActivityTransformerDto>>}
     */
    public async all (
        userId: string,
        orders: Orderization<ActivityTransformerDto>[],
        filters: Filterization<ActivityTransformerDto>[],
        page: OffsetPaginationType
    ): Promise<OffsetPagination<ActivityTransformerDto>>
    {
        const result = await this.activityAdminRepository.allOffset (userId, orders as never, filters as never, page);

        return {
            ... result,
            data: await Promise.all (result.data.map ((activity) => this.toDto (activity as never, false))),
        };
    }

    /**
     * @param {string} userId
     * @param {string} id
     * @returns {Promise<ActivityTransformerDto>}
     */
    public async get (userId: string, id: string): Promise<ActivityTransformerDto>
    {
        const activity = await this.activityAdminRepository.findById (userId, id);

        if (! activity) throw new NotFoundException (this.i18nService.t ("_v1_log.activity.not_found"));

        return this.toDto (activity as never, true);
    }
}
