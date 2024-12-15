import { BaseModel, } from "@intentjs/core";

/**
 * @class UserEntity
 * @extends {BaseModel}
 */
export class UserEntity extends BaseModel
{
   /**
    * @static
    * @type {boolean}
    */
   static softDelete = false;

   /**
    * @static
    * @type {string}
    */
    static tableName = "users";

   /**
    * @type {string | undefined}
    */
    id?: string;

   /**
    * @type {string}
    */
    name: string;

   /**
    * @type {string}
    */
    email: string;

   /**
    * @type {string}
    */
    password: string;

   /**
    * @type {Date}
    */
    emailVerifiedAt: Date;

   /**
    * @type {Date}
    */
    passwordChangedAt: Date;

   /**
    * @type {Date}
    */
    createdAt: Date;

   /**
    * @type {Date}
    */
    updatedAt: Date;

   /**
    * @type {Date}
    */
    deletedAt: Date;
}
