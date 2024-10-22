"use strict";

import { MigrationInterface, QueryRunner, Table, } from "typeorm";

/**
 * @class
 * @implements {MigrationInterface}
 */
export class Migration1729764171011Version implements MigrationInterface
{
    /**
     * @param {QueryRunner} queryRunner
     * @returns {Promise<void>}
     */
    public async up (queryRunner: QueryRunner): Promise<void>
    {
        await queryRunner.createTable (

            new Table ({

                name: "versions",
                columns: [

                    {
                        name: "id",
                        type: "varchar",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "gen_random_uuid ()",
                    },

                    {
                        name: "tag",
                        type: "varchar",
                    },
                ],
            })
        );
    }

    /**
     * @param {QueryRunner} queryRunner
     * @returns {Promise<void>}
     */
    public async down (queryRunner: QueryRunner): Promise<void>
    {
        await queryRunner.dropTable ("versions");
    }
};
