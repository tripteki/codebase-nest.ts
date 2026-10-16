"use strict";

/**
 * @param {unknown} value
 * @returns {string}
 */
function queryText (value: unknown): string
{
    if (Array.isArray (value)) {
        return value.map ((item) => String (item)).join (",");
    }

    return typeof value === "string" ? value : "";
}

/**
 * @param {unknown} value
 * @returns {Array<{ field: string; direction: "asc" | "desc" }> | null}
 */
export function parseUnifiedOrders (
    value: unknown
): Array<{ field: string; direction: "asc" | "desc" }> | null
{
    const text = queryText (value).trim ();

    if (! text || text.includes ("{")) {
        return null;
    }

    const parsed: Array<{ field: string; direction: "asc" | "desc" }> = [];

    for (const token of text.split (",")) {
        const parts = token.split (":");

        if (parts.length !== 2) {
            continue;
        }

        const field = parts[0].trim ();
        const direction = parts[1].trim ().toLowerCase () === "desc" ? "desc" : "asc";

        if (field) {
            parsed.push ({ field, direction, });
        }
    }

    return parsed.length ? parsed : null;
}

/**
 * @param {unknown} value
 * @returns {Array<{ field: string; search: string }> | null}
 */
export function parseUnifiedFilters (
    value: unknown
): Array<{ field: string; search: string }> | null
{
    const text = queryText (value).trim ();

    if (! text || text.includes ("{")) {
        return null;
    }

    const parsed: Array<{ field: string; search: string }> = [];

    for (const token of text.split (",")) {
        const parts = token.split (":");

        if (parts.length !== 2) {
            continue;
        }

        const field = parts[0].trim ();
        const search = parts[1].trim ();

        if (field && search) {
            parsed.push ({ field, search, });
        }
    }

    return parsed.length ? parsed : null;
}
