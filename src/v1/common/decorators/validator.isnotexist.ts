"use strict";

import { InjectDataSource, } from "@nestjs/typeorm";
import { I18nService, I18nContext, } from "nestjs-i18n";
import { DataSource as DataSourceService, EntityTarget, Repository, } from "typeorm";
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
     * @param {DataSourceService} dataSourceService
     * @param {I18nService} i18nService
     * @returns {void}
     */
    constructor (
        @InjectDataSource ("postgreConnection") private readonly dataSourceService: DataSourceService,
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

        [ entityClass, ] = args.constraints,
        entity: Repository<any> = await this.dataSourceService.getRepository (entityClass);

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
 * @param {EntityTarget<T>} entityClass
 * @param {ValidationOptions} validationOptions
 * @returns {Function}
 */
export function IsNotExist<T> (entityClass: EntityTarget<T>, validationOptions?: ValidationOptions): Function
{
    return (object: Record<string, any>, propertyName: string) =>
    {
        registerDecorator ({

            name: "isNotExist",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [ entityClass, ],
            validator: CommonIsNotExistDecoratorValidator,
        });
    };
}
