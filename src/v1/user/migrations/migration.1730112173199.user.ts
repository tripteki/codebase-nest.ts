"use strict";

import { MigrationInterface, QueryRunner, Table, } from "typeorm";

/**
 * @class
 * @implements {MigrationInterface}
 */
export class Migration1730112173199User implements MigrationInterface
{
    /**
     * @param {QueryRunner} queryRunner
     * @returns {Promise<void>}
     */
    public async up (queryRunner: QueryRunner): Promise<void>
    {
        await queryRunner.createTable (

            new Table ({

                name: "users",
                columns: [

                    {
                        name: "id",
                        type: "varchar",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "gen_random_uuid ()",
                    },
                    {
                        name: "name",
                        type: "varchar",
                    },
                    {
                        name: "email",
                        type: "varchar",
                        isUnique: true,
                    },
                    {
                        name: "email_verified_at",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "password",
                        type: "varchar",
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP (6)",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP (6)",
                        onUpdate: "CURRENT_TIMESTAMP (6)",
                    },
                    {
                        name: "deleted_at",
                        type: "timestamp",
                        isNullable: true,
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
        await queryRunner.dropTable ("users");
    }
};
