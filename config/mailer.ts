"use strict";

import {

    configNamespace,
    MailerOptions,

} from "@intentjs/core";

export default configNamespace ("mailers", (): MailerOptions => ({

    /**
     * The default channel for your mailer.
     */
    default: process.env.DEFAULT_MAILER || "logger",

    /**
     * -----------------------------------------------------
     * Mailer Channels
     * -----------------------------------------------------
     * Documentation - https://tryintent.com/docs/mailers
     *
     * Here you can configure all your different mailer channels.
     * A default configuration has been added for your application.
     *
     * Channel Providers: "logger", "smtp", "mailgun", "resend".
     */
    channels: {

        logger: {

            provider: "logger",
        },

        smtp: {

            provider: "smtp",
            ignoreTLS: false,
            requireTLS: false,

            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            username: process.env.MAIL_USER,
            password: process.env.MAIL_PASSWORD,

            from: process.env.MAIL_ADMIN_ADDRESS,
        },
    },

    /**
     * -----------------------------------------------------
     * Email Template Configuration
     * -----------------------------------------------------
     *
     * Here you can define default settings for email templates, 
     * such as the application name and footer content that will be used.
     */
    template: {

        appName: process.env.APP_NAME,

        footer: {

            title: process.env.APP_NAME,
        },
    },

}));
