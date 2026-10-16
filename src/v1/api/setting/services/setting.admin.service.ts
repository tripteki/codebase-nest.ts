import { ForbiddenException, Injectable, UnprocessableEntityException, } from "@nestjs/common";
import { randomBytes, } from "crypto";
import { mkdirSync, writeFileSync, } from "fs";
import { join, } from "path";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { Setting, } from "@prisma/client";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { AppService, } from "src/app/services/app.service";
import { assertImageUpload, } from "src/app/http/app.upload.guard";
import { ActivityRecorder, } from "src/v1/api/log/support/activity.recorder";
import { SettingTransformerDto, } from "src/v1/api/setting/dtos/setting.transformer.dto";
import { SettingBatchValidatorDto, SettingRowValidatorDto, } from "src/v1/api/setting/dtos/setting.validator.dto";
import { UserRoleEnum, userRoleSystemSettings, } from "src/v1/api/user/dtos/user.role.enum";
import { UserAclRepository, } from "src/v1/api/user/repositories/user.acl.repository";
import { ulid, } from "ulid";

/**
 * @type {string[]}
 */
export const VARIABLE_KEYS = [
    "APP_NAME",
    "COLOR_PRIMARY",
    "COLOR_SECONDARY",
    "COLOR_TERTIARY",
    "DEFAULT_LOCALE",
];

@Injectable ()
/**
 * @class {SettingAdminService}
 * @extends {AppService}
 */
export class SettingAdminService extends AppService
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {DatabasePrismaPostgreDriver} prismaPostgreService
     * @param {DateTimeHelper} dateTimeHelper
     * @param {UserAclRepository} userAclRepository
     * @param {ActivityRecorder} activityRecorder
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly prismaPostgreService: DatabasePrismaPostgreDriver,
        protected readonly dateTimeHelper: DateTimeHelper,
        protected readonly userAclRepository: UserAclRepository,
        protected readonly activityRecorder: ActivityRecorder
    )
    {
        super ();
    }

    /**
     * @param {Setting} setting
     * @returns {SettingTransformerDto}
     */
    protected toDto (setting: Setting): SettingTransformerDto
    {
        const frontendUrl = this.configService.get<string> ("app.frontendUrl") || "";
        const valueUrl = setting.value_kind === "file" && setting.value
            ? `${frontendUrl.replace (/\/$/, "")}/storage/${setting.value.replace (/^\//, "")}`
            : null;

        return new SettingTransformerDto ({
            id: setting.id,
            key: setting.key,
            value: setting.value,
            value_kind: setting.value_kind === "file" ? "file" : "text",
            value_url: valueUrl,
            created_at: setting.created_at,
            updated_at: setting.updated_at,
        });
    }

    /**
     * @param {string} userId
     * @returns {Promise<void>}
     */
    public async assertSystemAccess (userId: string): Promise<void>
    {
        const role = await this.userAclRepository.getUserRole (userId);

        if (! userRoleSystemSettings ().includes ((role || "") as UserRoleEnum)) {
            throw new ForbiddenException (this.i18nService.t ("_v1_setting.forbidden"));
        }
    }

    /**
     * @param {string} userId
     * @returns {Promise<{ data: SettingTransformerDto[]; }>}
     */
    public async all (userId: string): Promise<{ data: SettingTransformerDto[]; }>
    {
        await this.assertSystemAccess (userId);

        const settings = await this.prismaPostgreService.setting.findMany ({
            where: { deleted_at: null, },
            orderBy: { key: "asc", },
        });

        return { data: settings.map ((setting) => this.toDto (setting)), };
    }

    /**
     * @returns {Promise<Record<string, string | null>>}
     */
    public async variables (): Promise<Record<string, string | null>>
    {
        const result: Record<string, string | null> = {};

        for (const key of VARIABLE_KEYS) {
            const setting = await this.prismaPostgreService.setting.findFirst ({
                where: { key, deleted_at: null, },
            });
            result[key] = setting?.value ?? null;
        }

        return result;
    }

    /**
     * @param {string} userId
     * @param {SettingBatchValidatorDto} payload
     * @returns {Promise<{ data: SettingTransformerDto[]; }>}
     */
    public async sync (userId: string, payload: SettingBatchValidatorDto): Promise<{ data: SettingTransformerDto[]; }>
    {
        await this.assertSystemAccess (userId);

        const seen = new Set<string> ();
        const rows = payload.rows || [];

        for (const row of rows) {
            const key = (row.key || "").trim ().toUpperCase ();

            if (row.id && key === "") {
                await this.remove (userId, row.id);
                continue;
            }

            if (key === "" && ! (row.value || "").trim ()) continue;

            if (key === "") {
                throw new UnprocessableEntityException (this.i18nService.t ("_v1_setting.key_required"));
            }

            if (seen.has (key)) {
                throw new UnprocessableEntityException (this.i18nService.t ("_v1_setting.key_duplicate"));
            }

            seen.add (key);
            await this.upsert (userId, row, key);
        }

        return this.all (userId);
    }

    /**
     * @param {string} userId
     * @param {Record<string, string>} body
     * @param {Express.Multer.File[]} files
     * @returns {Promise<{ data: SettingTransformerDto[]; }>}
     */
    public async syncMultipart (
        userId: string,
        body: Record<string, string>,
        files: Express.Multer.File[]
    ): Promise<{ data: SettingTransformerDto[]; }>
    {
        const rows = new Map<number, SettingRowValidatorDto> ();
        const uploads = new Map<number, Express.Multer.File> ();

        for (const [ key, value, ] of Object.entries (body || {})) {
            const parsed = this.parseRowKey (key);

            if (! parsed || parsed.field === "file") continue;

            const row = rows.get (parsed.index) || new SettingRowValidatorDto ();
            if (parsed.field === "id") row.id = value;
            if (parsed.field === "key") row.key = value;
            if (parsed.field === "value") row.value = value;
            if (parsed.field === "value_kind") row.value_kind = value === "file" ? "file" : "text";
            rows.set (parsed.index, row);
        }

        for (const file of files || []) {
            const parsed = this.parseRowKey (file.fieldname);

            if (! parsed) continue;

            uploads.set (parsed.index, file);
            const row = rows.get (parsed.index) || new SettingRowValidatorDto ();
            row.value_kind = "file";
            rows.set (parsed.index, row);
        }

        const extensions = new Map<number, string> ();

        for (const [ index, file, ] of uploads) {
            if (rows.has (index)) extensions.set (index, assertImageUpload (file, [ "rows", index, "file", ], true));
        }

        for (const [ index, file, ] of uploads) {
            const row = rows.get (index);

            if (! row) continue;

            row.value = this.saveSettingFile (file, extensions.get (index));
            row.value_kind = "file";
        }

        return this.sync (userId, { rows: Array.from (rows.values ()), });
    }

    /**
     * @param {string} key
     * @returns {{ index: number; field: string; } | null}
     */
    protected parseRowKey (key: string): { index: number; field: string; } | null
    {
        const match = /^rows\[(\d+)\]\[([^\]]+)\]$/.exec (key);

        if (! match) return null;

        return { index: Number (match[1]), field: match[2], };
    }

    /**
     * @param {Express.Multer.File} file
     * @param {string} extension
     * @returns {string}
     */
    protected saveSettingFile (file: Express.Multer.File, extension: string): string
    {
        const directory = join (this.configService.get<string> ("storage.disks.public.path"), "settings");

        mkdirSync (directory, { recursive: true, });

        const filename = `${randomBytes (16).toString ("hex")}${extension}`;

        writeFileSync (join (directory, filename), file.buffer);

        return `settings/${filename}`;
    }

    /**
     * @param {string} userId
     * @param {string} id
     * @returns {Promise<void>}
     */
    protected async remove (userId: string, id: string): Promise<void>
    {
        const existing = await this.prismaPostgreService.setting.findFirst ({
            where: { id, deleted_at: null, },
        });

        if (! existing) return;

        await this.prismaPostgreService.setting.update ({
            where: { id, },
            data: { deleted_at: this.dateTimeHelper.now (), updated_at: this.dateTimeHelper.now (), },
        });

        await this.activityRecorder.log ("setting deleted", "deleted", "Setting", existing.id, userId, {
            old: {
                key: existing.key,
                value: existing.value,
                value_kind: existing.value_kind,
            },
        });
    }

    /**
     * @param {string} userId
     * @param {SettingRowValidatorDto} row
     * @param {string} key
     * @returns {Promise<void>}
     */
    protected async upsert (userId: string, row: SettingRowValidatorDto, key: string): Promise<void>
    {
        const now = this.dateTimeHelper.now ();
        const valueKind = row.value_kind === "file" ? "file" : "text";
        const value = (row.value || "").trim () || null;
        const previous = row.id
            ? await this.prismaPostgreService.setting.findFirst ({ where: { id: row.id, deleted_at: null, }, })
            : await this.prismaPostgreService.setting.findFirst ({ where: { key, deleted_at: null, }, });

        if (! previous) {
            const created = await this.prismaPostgreService.setting.create ({
                data: {
                    id: ulid (),
                    key,
                    value,
                    value_kind: valueKind,
                    created_at: now,
                    updated_at: now,
                },
            });

            await this.activityRecorder.log ("setting created", "created", "Setting", created.id, userId, {
                attributes: { key, value, value_kind: valueKind, },
            });

            return;
        }

        const updated = await this.prismaPostgreService.setting.update ({
            where: { id: previous.id, },
            data: { key, value, value_kind: valueKind, updated_at: now, },
        });

        await this.activityRecorder.log ("setting updated", "updated", "Setting", updated.id, userId, {
            old: {
                key: previous.key,
                value: previous.value,
                value_kind: previous.value_kind,
            },
            attributes: { key, value, value_kind: valueKind, },
        });
    }
}
