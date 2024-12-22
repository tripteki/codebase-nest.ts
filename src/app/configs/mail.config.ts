"use strict";

import { registerAs, } from "@nestjs/config";

export default registerAs ("mail", () => ({

    /**
     * -----------------------------------------------------
     * Preview Mode
     * -----------------------------------------------------
     *
     * Determines whether the email should be shown in preview
     * mode before actually being sent.
     * If the `MAIL_PREVIEW` environment variable is set, its value
     * will be used. Otherwise, it defaults to `false`.
     */
    preview: Boolean (process.env.MAIL_PREVIEW || false),

    /**
     * -----------------------------------------------------
     * Transport URI
     * -----------------------------------------------------
     *
     * Specifies the email transport that the application will use
     * while mailing. This is typically a URI containing connection
     * details for the email service provider (e.g., SMTP, Mailgun, Postmark).
     * The transport URI is taken from the `MAIL_URI` environment variable.
     */
    transport: String (process.env.MAIL_URI),

    /**
     * -----------------------------------------------------
     * Defaults
     * -----------------------------------------------------
     *
     * Specifies the default settings that will be used.
     */
    defaults: {

        /**
         * If the `MAIL_FROM` environment variable is not set, the default
         * value `"noreply@mail.com"` will be used as the sender address to the receiver.
         */
        from: `"No Reply" <${process.env.MAIL_FROM || "noreply@mail.com"}>`,
    },

}));
