import { Injectable, Logger, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import webpush from "web-push";
import { PushSubscription, } from "@prisma/client";
import { AppService, } from "src/app/services/app.service";
import { UserWebpushRepository, } from "src/v1/api/user/repositories/user.webpush.repository";

type WebPushPayloadData = Record<string, unknown>;

type WebPushPayload = {
    title: string;
    body: string;
    icon: string;
    badge: string;
    tag: string;
    actions?: Array<{ title: string; action: string }>;
    data: WebPushPayloadData;
};

@Injectable ()
/**
 * @class {NotificationWebpushService}
 * @extends {AppService}
 */
export class NotificationWebpushService extends AppService
{
    protected readonly logger = new Logger (NotificationWebpushService.name);

    /**
     * @param {ConfigService} configService
     * @param {UserWebpushRepository} userWebpushRepository
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly userWebpushRepository: UserWebpushRepository
    )
    {
        super ();
    }

    /**
     * @param {string} userId
     * @param {string} notificationId
     * @param {string} type
     * @param {WebPushPayloadData} data
     * @returns {Promise<void>}
     */
    public async dispatch (
        userId: string,
        notificationId: string,
        type: string,
        data: WebPushPayloadData
    ): Promise<void>
    {
        const publicKey = this.configService.get<string> ("webpush.vapid.publicKey") || "";

        if (! publicKey.trim ()) {
            return;
        }

        const subscriptions = await this.userWebpushRepository.findByUserId (userId);

        if (! subscriptions.length) {
            return;
        }

        const privateKey = this.configService.get<string> ("webpush.vapid.privateKey") || "";
        const subject = this.configService.get<string> ("webpush.vapid.subject") || "";
        const frontendUrl = this.configService.get<string> ("app.frontendUrl") || "http://localhost:3000";

        webpush.setVapidDetails (subject, publicKey, privateKey);

        const payload = this.buildPayload (notificationId, type, data, frontendUrl);

        for (const subscription of subscriptions) {
            await this.sendToSubscription (subscription, payload);
        }
    }

    /**
     * @param {string} notificationId
     * @param {string} type
     * @param {WebPushPayloadData} data
     * @param {string} frontendUrl
     * @returns {WebPushPayload}
     */
    protected buildPayload (
        notificationId: string,
        type: string,
        data: WebPushPayloadData,
        frontendUrl: string
    ): WebPushPayload
    {
        const url = this.resolveUrl (data, frontendUrl);
        const downloadUrl = this.resolveDownloadUrl (data);
        const payloadData = {
            ... data,
            url,
            notification_id: notificationId,
            type,
        };

        const message: WebPushPayload = {
            title: this.resolveTitle (type, data),
            body: this.resolveBody (type, data),
            icon: "/manifest/icon-512x512.png",
            badge: "/manifest/icon-192x192.png",
            tag: `notification_${notificationId}`,
            data: payloadData,
        };

        if (downloadUrl) {
            message.actions = [{ title: "Download", action: downloadUrl, }];
        } else if (url) {
            message.actions = [{ title: "Open", action: url, }];
        }

        return message;
    }

    /**
     * @param {string} type
     * @param {WebPushPayloadData} data
     * @returns {string}
     */
    protected resolveTitle (type: string, data: WebPushPayloadData): string
    {
        const title = String (data.title ?? "").trim ();

        if (title) {
            return title;
        }

        const message = String (data.message ?? "").trim ();

        if (message) {
            return message;
        }

        return type;
    }

    /**
     * @param {string} type
     * @param {WebPushPayloadData} data
     * @returns {string}
     */
    protected resolveBody (type: string, data: WebPushPayloadData): string
    {
        const lines: string[] = [];
        const headline = String (data.body_primary ?? "").trim ();

        if (headline) {
            lines.push (headline);
        } else if (String (data.filename ?? "").trim ()) {
            lines.push (String (data.filename).trim ());
        } else {
            const message = String (data.message ?? "").trim ();
            const title = String (data.title ?? "").trim ();

            if (message && title && message !== title) {
                lines.push (message);
            }
        }

        const secondary = String (data.body_secondary ?? "").trim ();

        if (secondary) {
            lines.push (secondary);
        } else if (String (data.error ?? "").trim ()) {
            lines.push (String (data.error).trim ());
        }

        const presentationLines = data.presentation_lines;

        if (Array.isArray (presentationLines)) {
            for (const line of presentationLines) {
                if (typeof line !== "string" || ! line.trim ()) {
                    continue;
                }

                lines.push (line.trim ());

                if (lines.length >= 4) {
                    break;
                }
            }
        }

        if (lines.length) {
            return lines.join ("\n");
        }

        const totalImported = data.totalImported;

        if (totalImported !== undefined && totalImported !== null) {
            const imported = Number (totalImported).toLocaleString ();
            const skipped = Number (data.totalSkipped ?? 0).toLocaleString ();

            return `${imported} imported, ${skipped} skipped`;
        }

        return this.resolveTitle (type, data);
    }

    /**
     * @param {WebPushPayloadData} data
     * @param {string} frontendUrl
     * @returns {string}
     */
    protected resolveUrl (data: WebPushPayloadData, frontendUrl: string): string
    {
        for (const key of [ "pdf_url", "fileUrl", "url", ]) {
            const value = data[key];

            if (typeof value === "string" && value.trim ()) {
                return value.trim ();
            }
        }

        return `${frontendUrl.replace (/\/$/, "")}/notifications`;
    }

    /**
     * @param {WebPushPayloadData} data
     * @returns {string | null}
     */
    protected resolveDownloadUrl (data: WebPushPayloadData): string | null
    {
        const fileUrl = data.fileUrl;

        if (typeof fileUrl === "string" && fileUrl.trim ()) {
            return fileUrl.trim ();
        }

        return null;
    }

    /**
     * @param {PushSubscription} subscription
     * @param {WebPushPayload} payload
     * @returns {Promise<void>}
     */
    protected async sendToSubscription (
        subscription: PushSubscription,
        payload: WebPushPayload
    ): Promise<void>
    {
        try {
            await webpush.sendNotification (
                {
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: subscription.public_key || "",
                        auth: subscription.auth_token || "",
                    },
                },
                JSON.stringify (payload),
                {
                    TTL: 3600,
                }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode;

            if (statusCode === 404 || statusCode === 410) {
                await this.userWebpushRepository.deleteById (subscription.id);

                return;
            }

            this.logger.warn (
                `Web push failed for subscription ${subscription.id}: ${error?.message || error}`
            );
        }
    }
}
