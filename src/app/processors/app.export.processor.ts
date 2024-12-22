"use strict";

import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { EventEmitter2 as EventListenerService, } from "@nestjs/event-emitter";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

@Injectable ()
/**
 * @class {AppExportProcessor}
 * @abstract {AppExportProcessor}
 */
export abstract class AppExportProcessor
{
    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {EventListenerService} eventListenerService
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly i18nService: I18nService,
        protected readonly eventListenerService: EventListenerService
    )
    {
        //
    }

    /**
     * @param {Record<string, any>[]} data
     * @param {string} filename
     * @param {string} type
     * @param {string} subfolder
     * @param {string} sheetName
     * @returns {Promise<{ filePath: string; fileUrl: string; }>}
     */
    protected async exportFile (
        data: Record<string, any>[],
        filename: string,
        type: string = "csv",
        subfolder: string = "export",
        sheetName: string = "Sheet1"
    ): Promise<{ filePath: string; fileUrl: string; }>
    {
        const publicStoragePath = this.configService.get<string> ("storage.disks.public.path");
        const exportPath = path.join (publicStoragePath, subfolder);
        const filePath = path.join (exportPath, filename);

        if (! fs.existsSync (exportPath)) {

            fs.mkdirSync (exportPath, { recursive: true, });
        }

        if (type === "csv") {

            const worksheet = XLSX.utils.json_to_sheet (data);
            const csvContent = XLSX.utils.sheet_to_csv (worksheet);

            fs.writeFileSync (filePath, csvContent, "utf8");

        } else {

            const workbook = XLSX.utils.book_new ();
            const worksheet = XLSX.utils.json_to_sheet (data);

            XLSX.utils.book_append_sheet (workbook, worksheet, sheetName);

            XLSX.writeFile (workbook, filePath, {

                bookType: type as "xls" | "xlsx",
            });
        }

        const fileUrl = `storage/${subfolder}/${filename}`;

        return {
            filePath,
            fileUrl,
        };
    }
}
