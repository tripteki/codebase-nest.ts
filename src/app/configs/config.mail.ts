"use strict";

import { registerAs, } from "@nestjs/config";

export default registerAs ("mail", () => (
{
    /**
     * Enables preview mode for the mail transport. When set to true,
     * this allows you to preview emails instead of sending them.
     */
    preview: Boolean (process.env.MAIL_PREVIEW || false),

    /**
     * Defines the transport mechanism for sending emails.
     * The transport string is derived from the environment variable MAIL_URI.
     */
    transport: String (process.env.MAIL_URI),

    /**
     * Default settings for emails.
     */
    defaults: {

        /**
         * Sets the default 'from' address for emails.
         * If MAIL_FROM is not defined in the environment variables,
         * it defaults to "noreply@mail.com".
         */
        from: `"No Reply" <${process.env.MAIL_FROM || "noreply@mail.com"}>`,
    },
}));
