"use strict";

import { ValidationError, } from "class-validator";

/**
 * @typedef {object} AppValidationDetail
 */
export type AppValidationDetail = {
    type: string;
    loc: Array<string | number>;
    msg: string;
    input: unknown;
    ctx: Record<string, unknown>;
};

/**
 * @param {string} value
 * @returns {string}
 */
const emailReason = (value: string): string =>
{
    const email = String (value ?? "");
    const at = email.indexOf ("@");

    if (at < 0) return "An email address must have an @-sign.";

    const local = email.slice (0, at);
    const domain = email.slice (at + 1);

    if (! local) return "There must be something before the @-sign.";

    if (! domain) return "There must be something after the @-sign.";

    if (domain.includes ("@")) return "The part after the @-sign contains invalid characters: '@'.";

    if (email.endsWith (".")) return "An email address cannot end with a period.";

    if (email.startsWith (".")) return "An email address cannot start with a period.";

    if (local.endsWith (".")) return "An email address cannot have a period immediately before the @-sign.";

    if (domain.startsWith (".")) return "An email address cannot have a period immediately after the @-sign.";

    if (email.includes ("..")) return "An email address cannot have two periods in a row.";

    if (! domain.includes (".")) return "The part after the @-sign is not valid. It should have a period.";

    return "The email address is not valid.";
};

/**
 * @param {string} name
 * @param {string} text
 * @param {unknown} value
 * @returns {{ type: string, msg: string, ctx: Record<string, unknown> }}
 */
const mapConstraint = (
    name: string,
    text: string,
    value: unknown
): { type: string; msg: string; ctx: Record<string, unknown>; } =>
{
    const amount = Number ((String (text).match (/(\d+)/) || [])[1] || 0);

    if (name === "minLength") {
        return {
            type: "string_too_short",
            msg: `String should have at least ${amount} characters`,
            ctx: { min_length: amount, },
        };
    }

    if (name === "maxLength") {
        return {
            type: "string_too_long",
            msg: `String should have at most ${amount} characters`,
            ctx: { max_length: amount, },
        };
    }

    if (name === "isEmail") {
        const reason = emailReason (String (value ?? ""));

        return {
            type: "value_error",
            msg: `value is not a valid email address: ${reason}`,
            ctx: { reason, },
        };
    }

    if (name === "isNotEmpty" || name === "isDefined") {
        return {
            type: "missing",
            msg: "Field required",
            ctx: {},
        };
    }

    if (name === "isIn" || name === "isEnum") {
        const values = String (text).split (":").slice (1).join (":").split (",").map ((item) => item.trim ()).filter (Boolean);
        const quoted = values.map ((item) => `'${item}'`);
        const expected = quoted.length > 1
            ? `${quoted.slice (0, -1).join (", ")} or ${quoted[quoted.length - 1]}`
            : quoted.join ("");

        return {
            type: name === "isEnum" ? "enum" : "literal_error",
            msg: `Input should be ${expected}`,
            ctx: { expected, },
        };
    }

    if (name === "isString") {
        return {
            type: "string_type",
            msg: "Input should be a valid string",
            ctx: {},
        };
    }

    if (name === "isBoolean") {
        return {
            type: "bool_type",
            msg: "Input should be a valid boolean",
            ctx: {},
        };
    }

    if (name === "isArray") {
        return {
            type: "list_type",
            msg: "Input should be a valid list",
            ctx: {},
        };
    }

    return {
        type: "value_error",
        msg: text,
        ctx: {},
    };
};

/**
 * @type {string[]}
 */
const CONSTRAINT_ORDER = [
    "isDefined",
    "isNotEmpty",
    "isString",
    "isBoolean",
    "isInt",
    "isNumber",
    "isArray",
    "isIn",
    "isEnum",
    "minLength",
    "maxLength",
    "isEmail",
];

/**
 * @param {Record<string, string>} constraints
 * @param {unknown} value
 * @returns {string}
 */
const firstConstraint = (
    constraints: Record<string, string>,
    value: unknown
): string =>
{
    const names = Object.keys (constraints);

    if (value === undefined || value === null) {
        return names.find ((name) => name === "isDefined" || name === "isNotEmpty") || "isDefined";
    }

    return CONSTRAINT_ORDER.find ((name) => names.includes (name)) || names[0];
};

/**
 * @param {ValidationError[]} errors
 * @param {Array<string | number>} loc
 * @param {AppValidationDetail[]} details
 * @returns {void}
 */
const appendErrors = (
    errors: ValidationError[],
    loc: Array<string | number>,
    details: AppValidationDetail[]
): void =>
{
    for (const error of errors || []) {
        const nextLoc = [ ... loc, /^\d+$/.test (error.property) ? Number (error.property) : error.property, ];
        const constraints = error.constraints || {};

        if (Object.keys (constraints).length) {
            const name = firstConstraint (constraints, error.value);
            const mapped = mapConstraint (name, constraints[name] || "", error.value);
            const missing = error.value === undefined || error.value === null;

            details.push ({
                type: mapped.type,
                loc: [ "body", ... nextLoc, ],
                msg: mapped.msg,
                input: missing ? { ... (error.target as Record<string, unknown> || {}), } : error.value,
                ctx: mapped.ctx,
            });
        }

        if (error.children?.length) appendErrors (error.children, nextLoc, details);
    }
};

/**
 * @param {ValidationError[]} errors
 * @returns {AppValidationDetail[]}
 */
export const toFastApiValidationDetail = (errors: ValidationError[]): AppValidationDetail[] =>
{
    const details: AppValidationDetail[] = [];

    appendErrors (errors, [], details);

    return details;
};

/**
 * @param {string} message
 * @param {unknown} input
 * @returns {{ detail: AppValidationDetail[] }}
 */
export const unprocessableDetail = (
    message: string,
    input: unknown = {}
): { detail: AppValidationDetail[]; } =>
{
    return {
        detail: [
            {
                type: "value_error",
                loc: [ "body", ],
                msg: message,
                input,
                ctx: { error: message, },
            },
        ],
    };
};
