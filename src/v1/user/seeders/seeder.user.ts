"use strict";

import { Command, CommandRunner, } from "nest-commander";
import { InjectRepository, } from "@nestjs/typeorm";
import { Repository, } from "typeorm";
import { exit, } from "process";
import { UserEntity, } from "src/v1/user/entities/entity.user";
import { userFactory, } from "src/v1/user/factories/factory.user";

@Command ({ name: "user:seed", description: "Seed data.", })
/**
 * @class
 */
export class SeederCommandUser extends CommandRunner
{
    /**
     * @param {Repository<UserEntity>} userRepository
     * @returns {void}
     */
    constructor (
        @InjectRepository (UserEntity, "postgreConnection") private readonly userRepository: Repository<UserEntity>
    )
    {
        super ();
    }

    /**
     * @returns {Promise<void>}
     */
    public async run (): Promise<void>
    {
        console.log (await this.userRepository.save (await this.userRepository.create (userFactory ())));

        exit (0);
    }
};
