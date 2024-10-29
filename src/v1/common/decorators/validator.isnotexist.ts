"use strict";

import { ModuleRef, } from "@nestjs/core";
import { getEntityManagerToken, } from "@nestjs/typeorm";
import { I18nService, I18nContext, } from "nestjs-i18n";
import { EntityTarget, Repository, } from "typeorm";
import {

    ValidatorConstraintInterface,
    registerDecorator,
    ValidatorConstraint,
    ValidationArguments,
    ValidationOptions,

} from "class-validator";

@ValidatorConstraint ({ async: true, })
/**
 * @class
 * @implements {ValidatorConstraintInterface}
 */
export class CommonIsNotExistDecoratorValidator implements ValidatorConstraintInterface
{
    /**
     * @param {ModuleRef} moduleRef
     * @param {I18nService} i18nService
     * @returns {void}
     */
    constructor (
        private readonly moduleRef: ModuleRef,
        private readonly i18nService: I18nService
    )
    {
        //
    }

    /**
     * @param {string} value
     * @param {ValidationArguments} args
     * @returns {Promise<boolean>}
     */
    public async validate (value: string, args: ValidationArguments): Promise<boolean>
    {
        const

        { connectionName, entityClass, }: { connectionName: string; entityClass: EntityTarget<any>; } = args.constraints[0],
        entity: Repository<any> = await this.moduleRef.get (getEntityManagerToken (connectionName)).getRepository (entityClass);

        return ! await entity.findOneBy ({ [args.property]: value, });
    }

    /**
     * @param {ValidationArguments} args
     * @returns {string}
     */
    public defaultMessage (args: ValidationArguments): string
    {
        return this.i18nService.t ("validation.unique", { args: { attribute: args.property, }, });
    }
}

/**
 * @function
 *
 * @param {Record<string, any>} validationArguments
 * @param {ValidationOptions} validationOptions
 * @returns {Function}
 */
export function IsNotExist (validationArguments: Record<string, any>, validationOptions?: ValidationOptions): Function
{
    return (object: Record<string, any>, propertyName: string) =>
    {
        registerDecorator ({

            name: "isNotExist",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [ validationArguments, ],
            validator: CommonIsNotExistDecoratorValidator,
        });
    };
}
