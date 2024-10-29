"use strict";

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BeforeInsert, BeforeUpdate, } from "typeorm";
import hashHelper from "../../../app/helpers/helper.hash";

@Entity ("users")
/**
 * @class
 */
export class UserEntity
{
    @PrimaryGeneratedColumn ("uuid")
    /**
     * @type {string}
     */
    id: string;

    @Column ()
    /**
     * @type {string}
     */
    name: string;

    @Column ()
    /**
     * @type {string}
     */
    email: string;

    @Column ({ type: "timestamp", nullable: true, })
    /**
     * @type {Date}
     */
    email_verified_at: Date;

    @Column ()
    /**
     * @type {string}
     */
    password: string;

    @CreateDateColumn ()
    /**
     * @type {Date}
     */
    created_at: Date;

    @UpdateDateColumn ()
    /**
     * @type {Date}
     */
    updated_at: Date;

    @DeleteDateColumn ()
    /**
     * @type {Date}
     */
    deleted_at: Date;

    @BeforeInsert ()
    /**
     * @returns {Promise<void>}
     */
    public async createPassword (): Promise<void>
    {
        this.password = await hashHelper ().hash (this.password);
    }

    @BeforeUpdate ()
    /**
     * @returns {Promise<void>}
     */
    public async updatePassword (): Promise<void>
    {
        if (this.password) this.password = await hashHelper ().hash (this.password);
    }
};
