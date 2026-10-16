import { Injectable, } from "@nestjs/common";
import { EventEmitter2 as EventListenerService, } from "@nestjs/event-emitter";
import { Prisma, } from "@prisma/client";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { ulid, } from "ulid";

/**
 * @type {string}
 */
const CAUSER_TYPE_USER = "User";

@Injectable ()
/**
 * @class {ActivityRecorder}
 */
export class ActivityRecorder
{
    /**
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @param {DateTimeHelper} dateTimeHelper
     * @param {EventListenerService} eventListenerService
     * @returns {void}
     */
    constructor (
        protected readonly prismaPostgreService: DatabasePrismaPostgreDriver,
        protected readonly dateTimeHelper: DateTimeHelper,
        protected readonly eventListenerService: EventListenerService
    )
    {
        //
    }

    /**
     * @param {string} description
     * @param {string} event
     * @param {string} subjectType
     * @param {string} subjectId
     * @param {string | null} causerId
     * @param {Record<string, unknown>} properties
     * @returns {Promise<void>}
     */
    public async log (
        description: string,
        event: string,
        subjectType: string,
        subjectId: string,
        causerId: string | null,
        properties: Record<string, unknown> = {}
    ): Promise<void>
    {
        const now = this.dateTimeHelper.now ();

        await this.prismaPostgreService.activity.create ({
            data: {
                id: ulid (),
                log_name: "default",
                description,
                event,
                subject_type: subjectType,
                subject_id: subjectId,
                causer_type: causerId ? CAUSER_TYPE_USER : null,
                causer_id: causerId,
                properties: properties as Prisma.InputJsonValue,
                created_at: now,
                updated_at: now,
            },
        });

        this.eventListenerService.emit ("v1.admin.refresh", {
            subjectType,
            causerId,
        });
    }
}
