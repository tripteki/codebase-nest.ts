import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { EventEmitter2 as EventListenerService, } from "@nestjs/event-emitter";
import { I18nService, } from "nestjs-i18n";
import { InjectQueue, } from "@nestjs/bull";
import { AppService, } from "src/app/services/app.service";
import { OffsetPaginationType, CursorPaginationType, OffsetPagination, CursorPagination, Orderization, Filterization, } from "src/app/repositories/app.repository";
import { UserAdminActivatedEvent, } from "src/v1/api/user/events/user.admin.activated.event";
import { UserAdminDeactivatedEvent, } from "src/v1/api/user/events/user.admin.deactivated.event";
import { UserAdminRepository, } from "src/v1/api/user/repositories/user.admin.repository";
import { UserAuthIdentifierTransformerDto, UserTransformerDto, } from "src/v1/api/user/dtos/user.transformer.dto";
import { UserIdentifierDto, UserUpdateValidatorDto, UserCreateValidatorDto, } from "src/v1/api/user/dtos/user.validator.dto";
import { Queue, } from "bull";
import { plainToClass, } from "class-transformer";

@Injectable ()
/**
 * @class {UserAdminService}
 * @extends {AppService}
 */
export class UserAdminService extends AppService
{
    /**
     * @param {ConfigService} configService
     * @param {EventListenerService} eventListenerService
     * @param {I18nService} i18nService
     * @param {Queue} userAdminQueue
     * @param {UserAdminRepository} userAdminRepository
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly eventListenerService: EventListenerService,
        protected readonly i18nService: I18nService,
        @InjectQueue ("user-admin-queue") protected readonly userAdminQueue: Queue,
        protected readonly userAdminRepository: UserAdminRepository
    )
    {
        super ();
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {Orderization<UserTransformerDto>[]} orders
     * @param {Filterization<UserTransformerDto>[]} filters
     * @param {OffsetPaginationType} page
     * @returns {Promise<UserTransformerDto[]>}
     */
    public async all (
        { userId, }: UserAuthIdentifierTransformerDto,
        orders: Orderization<UserTransformerDto>[],
        filters: Filterization<UserTransformerDto>[],
        page: OffsetPaginationType
    ): Promise<OffsetPagination<UserTransformerDto>>
    {
        let dto: OffsetPagination<UserTransformerDto> = await this.userAdminRepository.allOffset (
            userId,
            orders,
            filters,
            page
        ); dto = {
            ... dto,
            data: plainToClass (UserTransformerDto, dto.data),
        };

        return dto;
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {UserIdentifierDto} id
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async get (
        { userId, }: UserAuthIdentifierTransformerDto,
        { id, }: UserIdentifierDto
    ): Promise<UserTransformerDto | string>
    {
        try {

            const dto: UserTransformerDto | null = plainToClass (UserTransformerDto, await this.userAdminRepository.get (
                userId,
                id
            ));

            return dto;

        } catch (error: any) {

            return error.message;
        }
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {UserIdentifierDto} id
     * @param {UserUpdateValidatorDto} data
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async update (
        { userId, }: UserAuthIdentifierTransformerDto,
        { id, }: UserIdentifierDto,
        data: UserUpdateValidatorDto
    ): Promise<UserTransformerDto | string>
    {
        try {

            const dto: UserTransformerDto | null = plainToClass (UserTransformerDto, await this.userAdminRepository.update (
                userId,
                id,
                data
            ));

            return dto;

        } catch (error: any) {

            return error.message;
        }
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {UserCreateValidatorDto} data
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async create (
        { userId, }: UserAuthIdentifierTransformerDto,
        data: UserCreateValidatorDto
    ): Promise<UserTransformerDto | string>
    {
        try {

            const dto: UserTransformerDto | null = plainToClass (UserTransformerDto, await this.userAdminRepository.create (
                userId,
                data
            ));

            return dto;

        } catch (error: any) {

            return error.message;
        }
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {UserIdentifierDto} id
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async restore (
        { userId, }: UserAuthIdentifierTransformerDto,
        { id, }: UserIdentifierDto
    ): Promise<UserTransformerDto | string>
    {
        try {

            const dto: UserTransformerDto | null = plainToClass (UserTransformerDto, await this.userAdminRepository.restore (
                userId,
                id
            ));

            if (dto) this.eventListenerService.emit ("v1.user.admin.activated", new UserAdminActivatedEvent (dto));

            return dto;

        } catch (error: any) {

            return error.message;
        }
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {UserIdentifierDto} id
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async delete (
        { userId, }: UserAuthIdentifierTransformerDto,
        { id, }: UserIdentifierDto
    ): Promise<UserTransformerDto | string>
    {
        try {

            const dto: UserTransformerDto | null = plainToClass (UserTransformerDto, await this.userAdminRepository.delete (
                userId,
                id
            ));

            if (dto) this.eventListenerService.emit ("v1.user.admin.deactivated", new UserAdminDeactivatedEvent (dto));

            return dto;

        } catch (error: any) {

            return error.message;
        }
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {UserIdentifierDto} id
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async verify (
        { userId, }: UserAuthIdentifierTransformerDto,
        { id, }: UserIdentifierDto
    ): Promise<UserTransformerDto | string>
    {
        try {

            const dto: UserTransformerDto | null = plainToClass (UserTransformerDto, await this.userAdminRepository.verify (
                userId,
                id
            ));

            return dto;

        } catch (error: any) {

            return error.message;
        }
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {string} file
     * @returns {Promise<string>}
     */
    public async import (
        { userId, }: UserAuthIdentifierTransformerDto,
        file: string
    ): Promise<string>
    {
        await this.userAdminQueue.add ("import", { userId, file, });

        return this.i18nService.t ("_v1_user.import.started.message");
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {string} type
     * @returns {Promise<string>}
     */
    public async export (
        { userId, }: UserAuthIdentifierTransformerDto,
        type: string = "csv"
    ): Promise<string>
    {
        const validTypes = [ "csv", "xls", "xlsx", ];
        const normalizedType = validTypes.includes (type.toLowerCase ()) ? type.toLowerCase () : "csv";

        await this.userAdminQueue.add ("export", { userId, type: normalizedType, });

        return this.i18nService.t ("_v1_user.export.started.message");
    }
}
