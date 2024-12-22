import { Injectable, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { EventEmitter2 as EventListenerService, } from "@nestjs/event-emitter";
import { AppService, } from "src/app/services/app.service";
import { OffsetPaginationType, CursorPaginationType, OffsetPagination, CursorPagination, Orderization, Filterization, } from "src/app/repositories/app.repository";
import { UserAdminActivatedEvent, } from "src/v1/api/user/events/user.admin.activated.event";
import { UserAdminDeactivatedEvent, } from "src/v1/api/user/events/user.admin.deactivated.event";
import { UserAdminRepository, } from "src/v1/api/user/repositories/user.admin.repository";
import { UserTransformerDto, } from "src/v1/api/user/dtos/user.transformer.dto";
import { UserIdentifierDto, UserUpdateValidatorDto, UserCreateValidatorDto, } from "src/v1/api/user/dtos/user.validator.dto";
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
     * @param {eventListenerService} EventListenerService
     * @param {UserAdminRepository} userAdminRepository
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly eventListenerService: EventListenerService,
        protected readonly userAdminRepository: UserAdminRepository
    )
    {
        super ();
    }

    /**
     * @param {Orderization<UserTransformerDto>[]} orders
     * @param {Filterization<UserTransformerDto>[]} filters
     * @param {OffsetPaginationType} page
     * @returns {Promise<UserTransformerDto[]>}
     */
    public async all (
        orders: Orderization<UserTransformerDto>[],
        filters: Filterization<UserTransformerDto>[],
        page: OffsetPaginationType
    ): Promise<OffsetPagination<UserTransformerDto>>
    {
        let dto: OffsetPagination<UserTransformerDto> = await this.userAdminRepository.allOffset (
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
     * @param {UserIdentifierDto} id
     * @returns {Promise<UserTransformerDto | null>}
     */
    public async get (
        { id, }: UserIdentifierDto
    ): Promise<UserTransformerDto | null>
    {
        const dto: UserTransformerDto | null = plainToClass (UserTransformerDto, await this.userAdminRepository.get (
            id
        ));

        return dto;
    }

    /**
     * @param {UserIdentifierDto} id
     * @param {UserUpdateValidatorDto} data
     * @returns {Promise<UserTransformerDto | null>}
     */
    public async update (
        { id, }: UserIdentifierDto,
        data: UserUpdateValidatorDto
    ): Promise<UserTransformerDto | null>
    {
        const dto: UserTransformerDto | null = plainToClass (UserTransformerDto, await this.userAdminRepository.update (
            id,
            data
        ));

        return dto;
    }

    /**
     * @param {UserCreateValidatorDto} data
     * @returns {Promise<UserTransformerDto | null>}
     */
    public async create (
        data: UserCreateValidatorDto
    ): Promise<UserTransformerDto | null>
    {
        const dto: UserTransformerDto | null = plainToClass (UserTransformerDto, await this.userAdminRepository.create (
            data
        ));

        return dto;
    }

    /**
     * @param {UserIdentifierDto} id
     * @returns {Promise<UserTransformerDto | null>}
     */
    public async restore (
        { id, }: UserIdentifierDto
    ): Promise<UserTransformerDto | null>
    {
        const dto: UserTransformerDto | null = plainToClass (UserTransformerDto, await this.userAdminRepository.restore (
            id
        ));

        if (dto) this.eventListenerService.emit ("v1.user.admin.activated", new UserAdminActivatedEvent (dto));

        return dto;
    }

    /**
     * @param {UserIdentifierDto} id
     * @returns {Promise<UserTransformerDto | null>}
     */
    public async delete (
        { id, }: UserIdentifierDto
    ): Promise<UserTransformerDto | null>
    {
        const dto: UserTransformerDto | null = plainToClass (UserTransformerDto, await this.userAdminRepository.delete (
            id
        ));

        if (dto) this.eventListenerService.emit ("v1.user.admin.deactivated", new UserAdminDeactivatedEvent (dto));

        return dto;
    }
}
