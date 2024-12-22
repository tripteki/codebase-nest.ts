import { Injectable, } from "@nestjs/common";
import { InjectQueue, } from "@nestjs/bull";
import { Queue, } from "bull";
import { OnEvent, } from "@nestjs/event-emitter";
import { ConfigService, } from "@nestjs/config";
import { NotificationCreatedEvent, } from "src/v1/api/notification/events/notification.created.event";
import { NotificationUserRepository, } from "src/v1/api/notification/repositories/notification.user.repository";
import { UserWebpushRepository, } from "src/v1/api/user/repositories/user.webpush.repository";

@Injectable ()
/**
 * @class {NotificationCreatedWebpushListener}
 */
export class NotificationCreatedWebpushListener
{
    /**
     * @param {ConfigService} configService
     * @param {NotificationUserRepository} notificationUserRepository
     * @param {UserWebpushRepository} userWebpushRepository
     * @param {Queue} notificationsQueue
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly notificationUserRepository: NotificationUserRepository,
        protected readonly userWebpushRepository: UserWebpushRepository,
        @InjectQueue ("notifications") protected readonly notificationsQueue: Queue
    )
    {
        //
    }

    @OnEvent ("v1.notification.created")
    /**
     * @param {NotificationCreatedEvent} event
     * @returns {Promise<void>}
     */
    public async handle (event: NotificationCreatedEvent): Promise<void>
    {
        const publicKey = this.configService.get<string> ("webpush.vapid.publicKey") || "";

        if (! publicKey.trim ()) {
            return;
        }

        const hasSubscriptions = await this.userWebpushRepository.hasPushSubscriptions (event.userId);

        if (! hasSubscriptions) {
            return;
        }

        const notification = await this.notificationUserRepository.get (
            event.userId,
            event.notificationId
        );

        if (! notification) {
            return;
        }

        await this.notificationsQueue.add ("webpush", {
            userId: event.userId,
            notificationId: event.notificationId,
            type: notification.type,
            data: notification.data as Record<string, unknown>,
        });
    }
}
