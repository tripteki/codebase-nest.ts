import { readFileSync, unlinkSync, existsSync, } from "fs";
import { extname, } from "path";
import { UnprocessableEntityException, } from "@nestjs/common";
import { I18nContext, } from "nestjs-i18n";

/**
 * @type {number}
 */
export const IMAGE_MAX_SIZE_BYTES: number = 2 * 1024 * 1024;

/**
 * @type {number}
 */
export const IMPORT_MAX_SIZE_BYTES: number = 5 * 1024 * 1024;

/**
 * @type {string[]}
 */
export const IMPORT_ALLOWED_EXTENSIONS: string[] = [ ".csv", ".txt", ".xls", ".xlsx", ];

/**
 * @type {string[]}
 */
export const AVATAR_ALLOWED_EXTENSIONS: string[] = [ ".jpg", ".jpeg", ".png", ".gif", ".webp", ];

/**
 * @type {string[]}
 */
export const AVATAR_ALLOWED_MIME_TYPES: string[] = [ "image/jpeg", "image/png", "image/gif", "image/webp", ];

/**
 * @param {string} key
 * @param {Record<string, unknown>} args
 * @returns {string}
 */
function uploadMessage (key: string, args: Record<string, unknown> = {}): string
{
    return String (I18nContext.current ()?.t (`_app.upload.${key}`, { args, }) ?? key);
}

/**
 * @param {Express.Multer.File | undefined} file
 * @returns {void}
 */
export function discardUpload (file?: Express.Multer.File): void
{
    if (file?.path && existsSync (file.path)) unlinkSync (file.path);
}

/**
 * @param {Array<string | number>} loc
 * @param {string} key
 * @param {unknown} input
 * @param {Record<string, unknown>} args
 * @returns {UnprocessableEntityException}
 */
export function uploadError (
    loc: Array<string | number>,
    key: string,
    input: unknown,
    args: Record<string, unknown> = {}
): UnprocessableEntityException
{
    return new UnprocessableEntityException ({
        detail: [
            { type: "value_error", loc: [ "body", ... loc, ], msg: uploadMessage (key, args), input: input ?? null, ctx: {}, },
        ],
    });
}

/**
 * @param {Buffer} content
 * @param {boolean} allowIcon
 * @returns {string | null}
 */
export function detectImageExtension (content: Buffer, allowIcon: boolean = false): string | null
{
    if (content.length >= 3 && content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff) return ".jpg";
    if (content.length >= 8 && content.subarray (0, 8).equals (Buffer.from ([ 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ]))) return ".png";
    if (content.length >= 6 && [ "GIF87a", "GIF89a", ].includes (content.subarray (0, 6).toString ())) return ".gif";
    if (content.length >= 12 && content.subarray (0, 4).toString () === "RIFF" && content.subarray (8, 12).toString () === "WEBP") return ".webp";
    if (allowIcon && content.length >= 4 && content.subarray (0, 4).equals (Buffer.from ([ 0x00, 0x00, 0x01, 0x00, ]))) return ".ico";

    return null;
}

/**
 * @param {Express.Multer.File} file
 * @returns {Buffer}
 */
function uploadContent (file: Express.Multer.File): Buffer
{
    return file.buffer ?? readFileSync (file.path);
}

/**
 * @param {Express.Multer.File} file
 * @param {Array<string | number>} loc
 * @param {boolean} allowIcon
 * @returns {string}
 */
export function assertImageUpload (
    file: Express.Multer.File,
    loc: Array<string | number>,
    allowIcon: boolean = false
): string
{
    if (file.size > IMAGE_MAX_SIZE_BYTES) {
        discardUpload (file);
        throw uploadError (loc, "too_large", file.originalname, { size: IMAGE_MAX_SIZE_BYTES / (1024 * 1024), });
    }

    const extension = detectImageExtension (uploadContent (file), allowIcon);

    if (! extension) {
        discardUpload (file);
        throw uploadError (loc, allowIcon ? "icon_type" : "image_type", file.originalname);
    }

    return extension;
}

/**
 * @param {Express.Multer.File} file
 * @param {string} field
 * @returns {string}
 */
export function assertAvatarUpload (file: Express.Multer.File, field: string = "avatar"): string
{
    const contentType = String (file.mimetype || "").toLowerCase ();

    if (! AVATAR_ALLOWED_EXTENSIONS.includes (extname (file.originalname || "").toLowerCase ())) {
        discardUpload (file);
        throw uploadError ([ field, ], "image_type", file.originalname);
    }

    if (contentType && ! AVATAR_ALLOWED_MIME_TYPES.includes (contentType)) {
        discardUpload (file);
        throw uploadError ([ field, ], "image_type", file.mimetype);
    }

    return assertImageUpload (file, [ field, ]);
}

/**
 * @param {Express.Multer.File} file
 * @param {string} field
 * @returns {void}
 */
export function assertImportUpload (file: Express.Multer.File, field: string = "file"): void
{
    if (! IMPORT_ALLOWED_EXTENSIONS.includes (extname (file.originalname || "").toLowerCase ())) {
        discardUpload (file);
        throw uploadError ([ field, ], "import_type", file.originalname);
    }

    if (file.size > IMPORT_MAX_SIZE_BYTES) {
        discardUpload (file);
        throw uploadError ([ field, ], "too_large", file.originalname, { size: IMPORT_MAX_SIZE_BYTES / (1024 * 1024), });
    }
}
