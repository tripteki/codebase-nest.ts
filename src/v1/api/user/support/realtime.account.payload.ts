import { DateTimeHelper, } from "src/app/helpers/datetime.helper";

/**
 * @param {Date | string | null | undefined} value
 * @param {DateTimeHelper} dateTimeHelper
 * @param {string} format
 * @returns {string | null}
 */
export function realtimeDate (
    value: Date | string | null | undefined,
    dateTimeHelper: DateTimeHelper,
    format: string
): string | null
{
    if (! value) return null;

    return dateTimeHelper.ref () (value).format (format);
}

/**
 * @param {{ id: string; name: string; email: string; email_verified_at?: Date | string | null; created_at?: Date | string | null; updated_at?: Date | string | null; deleted_at?: Date | string | null; }} event
 * @param {DateTimeHelper} dateTimeHelper
 * @param {string} format
 * @returns {{ id: string; name: string; email: string; email_verified_at: string | null; created_at: string | null; updated_at: string | null; deleted_at: string | null; }}
 */
export function realtimeAccountPayload (
    event: {
        id: string;
        name: string;
        email: string;
        email_verified_at?: Date | string | null;
        created_at?: Date | string | null;
        updated_at?: Date | string | null;
        deleted_at?: Date | string | null;
    },
    dateTimeHelper: DateTimeHelper,
    format: string
): {
    id: string;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}
{
    return {
        id: event.id,
        name: event.name,
        email: event.email,
        email_verified_at: realtimeDate (event.email_verified_at, dateTimeHelper, format),
        created_at: realtimeDate (event.created_at, dateTimeHelper, format),
        updated_at: realtimeDate (event.updated_at, dateTimeHelper, format),
        deleted_at: realtimeDate (event.deleted_at, dateTimeHelper, format),
    };
}
