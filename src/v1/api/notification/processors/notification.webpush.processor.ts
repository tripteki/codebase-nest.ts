import { Injectable, } from "@nestjs/common";
import { Processor, Process, } from "@nestjs/bull";
import { Job, } from "bull";
import { NotificationWebpushService, } from "src/v1/api/notification/services/notification.webpush.service";

type NotificationWebpushJobData = {
    userId: string;
    notificationId: string;
    type: string;
    data: Record<string, unknown>;
};

@Injectable ()
@Processor ("notifications")
/**
 * @class {NotificationWebpushProcessor}
 */
export class NotificationWebpushProcessor
{
    /**
     * @param {NotificationWebpushService} notificationWebpushService
     * @returns {void}
     */
    constructor (
        protected readonly notificationWebpushService: NotificationWebpushService
    )
    {
        //
    }

    @Process ("webpush")
    /**
     * @param {Job<NotificationWebpushJobData>} job
     * @returns {Promise<void>}
     */
    public async handle (job: Job<NotificationWebpushJobData>): Promise<void>
    {
        const { userId, notificationId, type, data, } = job.data;

        await this.notificationWebpushService.dispatch (
            userId,
            notificationId,
            type,
            data
        );
    }
}
