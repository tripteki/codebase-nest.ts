"use strict";

import { Entity, Column, PrimaryGeneratedColumn, } from "typeorm";

@Entity ("versions")
/**
 * @class
 */
export class VersionEntity
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
    tag: string;
};
