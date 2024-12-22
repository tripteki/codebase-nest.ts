"use strict";

import { registerAs, } from "@nestjs/config";

export default registerAs ("webpush", () => ({

    vapid: {

        subject: String (process.env.VAPID_SUBJECT || process.env.FRONTEND_URL || "http://localhost:3000"),
        publicKey: String (process.env.VAPID_PUBLIC_KEY || ""),
        privateKey: String (process.env.VAPID_PRIVATE_KEY || ""),
    },

    tableName: String (process.env.WEBPUSH_DB_TABLE || "push_subscriptions"),

    automaticPadding: process.env.WEBPUSH_AUTOMATIC_PADDING !== "false",

    notificationQueue: String (process.env.WEBPUSH_NOTIFICATION_QUEUE || "notifications"),

}));
