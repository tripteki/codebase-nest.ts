"use strict";

import { Injectable, Inject, Logger as LogService, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, I18nContext, } from "nestjs-i18n";
import { MailerService as MailService, } from "@nestjs-modules/mailer";
import { Cache as CacheService, } from "cache-manager";
import { InjectRepository, } from "@nestjs/typeorm";
import { Repository, } from "typeorm";
import { CACHE_MANAGER as CacheRepository, } from "@nestjs/cache-manager";
import { VersionEntity, } from "src/version/entities/entity.version";
import { join, } from "path";

@Injectable ()
/**
 * @class
 */
export class VersionService
{
    /**
     * @param {ConfigService} configService
     * @param {LogService} logService
     * @param {I18nService} i18nService
     * @param {MailService} mailService
     * @param {CacheService} cacheRepository
     * @param {Repository<VersionEntity>} versionRepository
     * @returns {void}
     */
    constructor (
        private readonly configService: ConfigService,
        private readonly logService: LogService,
        private readonly i18nService: I18nService,
        private readonly mailService: MailService,
        @Inject (CacheRepository) private readonly cacheRepository: CacheService,
        @InjectRepository (VersionEntity, "postgreConnection") private readonly versionRepository: Repository<VersionEntity>
    )
    {
        //
    }

    /**
     * @returns {Promise<string>}
     */
    async variable (): Promise<string>
    {
        const version: string = this.configService.get<string> ("app.name") + ":" + this.configService.get<string> ("app.version");

        await this.cacheRepository.set ("version", version);
        await this.logService.log (await this.cacheRepository.get ("version"));

        await this.versionRepository.save (await this.versionRepository.create ({ tag: version, }));

        await this.logService.log (await this.i18nService.t ("validation.present", {

            lang: "en",
            args: {

                attribute: "version",
            },
        }));

        await this.mailService.sendMail ({

            to: "user@mail.com",

            template: join (__dirname, "../", "views/mail/index"),
            context: {

                version,
            },
        });

        return version;
    }
};
