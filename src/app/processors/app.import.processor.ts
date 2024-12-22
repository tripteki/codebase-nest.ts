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
 * @class {AppImportProcessor}
 * @abstract {AppImportProcessor}
 */
export abstract class AppImportProcessor
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
     * @param {string} filePath
     * @param {string} subfolder
     * @returns {Promise<Record<string, any>[]>}
     */
    protected async importFile (
        filePath: string,
        subfolder: string = "import"
    ): Promise<Record<string, any>[]>
    {
        const publicStoragePath = this.configService.get<string> ("storage.disks.public.path");
        const importPath = path.join (publicStoragePath, subfolder);
        const fullFilePath = path.join (importPath, filePath);

        if (! fs.existsSync (fullFilePath)) {

            throw new Error (`File not found: ${fullFilePath}`);
        }

        const ext = path.extname (fullFilePath).toLowerCase ();
        let data: Record<string, any>[] = [];

        if ([ ".csv", ".xls", ".xlsx", ].includes (ext)) {

            const workbook = XLSX.readFile (fullFilePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            data = XLSX.utils.sheet_to_json (worksheet);

        } else {

            throw new Error (`Unsupported file type: ${ext}`);
        }

        return data;
    }
}
