import { Injectable, } from "@nestjs/common";
import { AppService, } from "src/app/services/app.service";
import { UserWebpushRepository, } from "src/v1/api/user/repositories/user.webpush.repository";
import {
    UserWebpushSubscribeValidatorDto,
    UserWebpushUnsubscribeValidatorDto,
    UserWebpushSuccessTransformerDto,
} from "src/v1/api/user/dtos/user.webpush.validator.dto";

@Injectable ()
/**
 * @class {UserWebpushService}
 * @extends {AppService}
 */
export class UserWebpushService extends AppService
{
    /**
     * @param {UserWebpushRepository} userWebpushRepository
     * @returns {void}
     */
    constructor (
        protected readonly userWebpushRepository: UserWebpushRepository
    )
    {
        super ();
    }

    /**
     * @param {string} userId
     * @param {UserWebpushSubscribeValidatorDto} data
     * @returns {Promise<UserWebpushSuccessTransformerDto>}
     */
    public async subscribe (
        userId: string,
        data: UserWebpushSubscribeValidatorDto
    ): Promise<UserWebpushSuccessTransformerDto>
    {
        await this.userWebpushRepository.updatePushSubscription (
            userId,
            data.endpoint,
            data.keys?.p256dh,
            data.keys?.auth,
            data.content_encoding
        );

        return { success: true, };
    }

    /**
     * @param {string} userId
     * @param {UserWebpushUnsubscribeValidatorDto} data
     * @returns {Promise<UserWebpushSuccessTransformerDto>}
     */
    public async unsubscribe (
        userId: string,
        data: UserWebpushUnsubscribeValidatorDto
    ): Promise<UserWebpushSuccessTransformerDto>
    {
        await this.userWebpushRepository.deletePushSubscription (
            userId,
            data.endpoint
        );

        return { success: true, };
    }
}
