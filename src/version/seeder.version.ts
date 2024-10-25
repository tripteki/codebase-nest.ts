"use strict";

import { Command, CommandRunner, } from "nest-commander";
import { InjectRepository, } from "@nestjs/typeorm";
import { Repository, } from "typeorm";
import { exit, } from "process";
import { VersionEntity, } from "src/version/entity.version";
import { versionFactory, } from "src/version/factory.version";

@Command ({ name: "version:seed", description: "Seed data.", })
/**
 * @class
 */
export class SeederCommandVersion extends CommandRunner
{
    /**
     * @param {Repository<VersionEntity>} versionRepository
     * @returns {void}
     */
    constructor (
        @InjectRepository (VersionEntity, "postgreConnection") private readonly versionRepository: Repository<VersionEntity>
    )
    {
        super ();
    }

    /**
     * @returns {Promise<void>}
     */
    public async run (): Promise<void>
    {
        console.log (await this.versionRepository.save (await this.versionRepository.create (versionFactory ())));

        exit (0);
    }
};
