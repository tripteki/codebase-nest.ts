import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { EventEmitter2 as EventListenerService, } from "@nestjs/event-emitter";
import { AppService, } from "src/app/services/app.service";
import { BatchPayloadType, } from "src/app/dtos/app.dto";
import { OffsetPaginationType, CursorPaginationType, OffsetPagination, CursorPagination, Orderization, Filterization, } from "src/app/repositories/app.repository";
import { NotificationUserRepository, } from "src/v1/api/notification/repositories/notification.user.repository";
import { UserAuthIdentifierTransformerDto, } from "src/v1/api/user/dtos/user.transformer.dto";
import { NotificationCountTransformerDto, NotificationReadTransformerDto, NotificationUnreadTransformerDto, NotificationTransformerDto, } from "src/v1/api/notification/dtos/notification.transformer.dto";
import { NotificationIdentifierDto, NotificationCreateValidatorDto, } from "src/v1/api/notification/dtos/notification.validator.dto";
import { plainToClass, } from "class-transformer";

@Injectable ()
/**
 * @class {NotificationUserService}
 * @extends {AppService}
 */
export class NotificationUserService extends AppService
{
    /**
     * @param {ConfigService} configService
     * @param {EventListenerService} eventListenerService
     * @param {NotificationUserRepository} notificationUserRepository
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly eventListenerService: EventListenerService,
        protected readonly notificationUserRepository: NotificationUserRepository
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
        let dto: OffsetPagination<NotificationTransformerDto> = await this.notificationUserRepository.allOffset (
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
     * @returns {Promise<NotificationCountTransformerDto>}
     */
    public async count (
        { userId, }: UserAuthIdentifierTransformerDto
    ): Promise<NotificationCountTransformerDto>
    {
        try {

            const dto: NotificationCountTransformerDto = { count: await this.notificationUserRepository.count (
                userId
            ), };

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
    public async get (
        { userId, }: UserAuthIdentifierTransformerDto,
        { id, }: NotificationIdentifierDto
    ): Promise<NotificationTransformerDto | string>
    {
        try {

            const dto: NotificationTransformerDto | null = plainToClass (NotificationTransformerDto, await this.notificationUserRepository.get (
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
     * @returns {Promise<BatchPayloadType>}
     */
    public async readAll (
        { userId, }: UserAuthIdentifierTransformerDto
    ): Promise<BatchPayloadType>
    {
        try {

            const dto: BatchPayloadType = await this.notificationUserRepository.readAll (
                userId
            );

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
    public async read (
        { userId, }: UserAuthIdentifierTransformerDto,
        { id, }: NotificationIdentifierDto
    ): Promise<NotificationTransformerDto | string>
    {
        try {

            const dto: NotificationTransformerDto | null = plainToClass (NotificationTransformerDto, await this.notificationUserRepository.read (
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
     * @returns {Promise<NotificationUnreadTransformerDto>}
     */
    public async unread (
        { userId, }: UserAuthIdentifierTransformerDto
    ): Promise<NotificationUnreadTransformerDto>
    {
        try {

            const dto: NotificationUnreadTransformerDto = { unread: await this.notificationUserRepository.unread (
                userId
            ), };

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
    public async notify (
        { userId, }: UserAuthIdentifierTransformerDto,
        data: NotificationCreateValidatorDto
    ): Promise<NotificationTransformerDto | string>
    {
        try {

            const dto: NotificationTransformerDto | null = plainToClass (NotificationTransformerDto, await this.notificationUserRepository.create (
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
    public async delete (
        { userId, }: UserAuthIdentifierTransformerDto,
        { id, }: NotificationIdentifierDto
    ): Promise<NotificationTransformerDto | string>
    {
        try {

            const dto: NotificationTransformerDto | null = plainToClass (NotificationTransformerDto, await this.notificationUserRepository.delete (
                userId,
                id
            ));

            return dto;

        } catch (error: any) {

            return error.message;
        }
    }
}
