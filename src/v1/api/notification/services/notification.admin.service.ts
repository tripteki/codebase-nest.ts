import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { EventEmitter2 as EventListenerService, } from "@nestjs/event-emitter";
import { AppService, } from "src/app/services/app.service";
import { OffsetPaginationType, CursorPaginationType, OffsetPagination, CursorPagination, Orderization, Filterization, } from "src/app/repositories/app.repository";
import { NotificationAdminRepository, } from "src/v1/api/notification/repositories/notification.admin.repository";
import { UserAuthIdentifierTransformerDto, } from "src/v1/api/user/dtos/user.transformer.dto";
import { NotificationTransformerDto, } from "src/v1/api/notification/dtos/notification.transformer.dto";
import { NotificationIdentifierDto, NotificationUpdateValidatorDto, NotificationCreateValidatorDto, } from "src/v1/api/notification/dtos/notification.validator.dto";
import { plainToClass, } from "class-transformer";

@Injectable ()
/**
 * @class {NotificationAdminService}
 * @extends {AppService}
 */
export class NotificationAdminService extends AppService
{
    /**
     * @param {ConfigService} configService
     * @param {EventListenerService} eventListenerService
     * @param {NotificationAdminRepository} notificationAdminRepository
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly eventListenerService: EventListenerService,
        protected readonly notificationAdminRepository: NotificationAdminRepository
    )
    {
        super ();
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {Orderization<NotificationTransformerDto>[]} orders
     * @param {Filterization<NotificationTransformerDto>[]} filters
     * @param {OffsetPaginationType} page
     * @returns {Promise<NotificationTransformerDto[]>}
     */
    public async all (
        { userId, }: UserAuthIdentifierTransformerDto,
        orders: Orderization<NotificationTransformerDto>[],
        filters: Filterization<NotificationTransformerDto>[],
        page: OffsetPaginationType
    ): Promise<OffsetPagination<NotificationTransformerDto>>
    {
        let dto: OffsetPagination<NotificationTransformerDto> = await this.notificationAdminRepository.allOffset (
            userId,
            orders,
            filters,
            page
        ); dto = {
            ... dto,
            data: plainToClass (NotificationTransformerDto, dto.data),
        };

        return dto;
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {NotificationIdentifierDto} id
     * @returns {Promise<NotificationTransformerDto | string>}
     */
    public async get (
        { userId, }: UserAuthIdentifierTransformerDto,
        { id, }: NotificationIdentifierDto
    ): Promise<NotificationTransformerDto | string>
    {
        try {

            const dto: NotificationTransformerDto | null = plainToClass (NotificationTransformerDto, await this.notificationAdminRepository.get (
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
     * @param {NotificationIdentifierDto} id
     * @param {NotificationUpdateValidatorDto} data
     * @returns {Promise<NotificationTransformerDto | string>}
     */
    public async update (
        { userId, }: UserAuthIdentifierTransformerDto,
        { id, }: NotificationIdentifierDto,
        data: NotificationUpdateValidatorDto
    ): Promise<NotificationTransformerDto | string>
    {
        try {

            const dto: NotificationTransformerDto | null = plainToClass (NotificationTransformerDto, await this.notificationAdminRepository.update (
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
     * @param {NotificationCreateValidatorDto} data
     * @returns {Promise<NotificationTransformerDto | string>}
     */
    public async create (
        { userId, }: UserAuthIdentifierTransformerDto,
        data: NotificationCreateValidatorDto
    ): Promise<NotificationTransformerDto | string>
    {
        try {

            const dto: NotificationTransformerDto | null = plainToClass (NotificationTransformerDto, await this.notificationAdminRepository.create (
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
     * @param {NotificationIdentifierDto} id
     * @returns {Promise<NotificationTransformerDto | string>}
     */
    public async restore (
        { userId, }: UserAuthIdentifierTransformerDto,
        { id, }: NotificationIdentifierDto
    ): Promise<NotificationTransformerDto | string>
    {
        try {

            const dto: NotificationTransformerDto | null = plainToClass (NotificationTransformerDto, await this.notificationAdminRepository.restore (
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
     * @param {NotificationIdentifierDto} id
     * @returns {Promise<NotificationTransformerDto | string>}
     */
    public async delete (
        { userId, }: UserAuthIdentifierTransformerDto,
        { id, }: NotificationIdentifierDto
    ): Promise<NotificationTransformerDto | string>
    {
        try {

            const dto: NotificationTransformerDto | null = plainToClass (NotificationTransformerDto, await this.notificationAdminRepository.delete (
                userId,
                id
            ));

            return dto;

        } catch (error: any) {

            return error.message;
        }
    }
}
