import { Request, Response, } from "express";
import { Socket, } from "socket.io";
import { Injectable, Inject, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { EventEmitter2 as EventListenerService, } from "@nestjs/event-emitter";
import { I18nService, } from "nestjs-i18n";
import { JwtService, } from "@nestjs/jwt";
import { AppService, } from "src/app/services/app.service";
import { CACHE_MANAGER, Cache as CacheService, } from "@nestjs/cache-manager";
import { UrlHelper, } from "src/app/helpers/url.helper";
import { UserAuthLoggedInEvent, } from "src/v1/api/user/events/user.auth.loggedin.event";
import { UserAuthLoggedOutEvent, } from "src/v1/api/user/events/user.auth.loggedout.event";
import { UserAuthRefreshedEvent, } from "src/v1/api/user/events/user.auth.refreshed.event";
import { UserAuthRegisteredEvent, } from "src/v1/api/user/events/user.auth.registered.event";
import { UserAuthResetEvent, } from "src/v1/api/user/events/user.auth.reset.event";
import { UserAuthRepository, } from "src/v1/api/user/repositories/user.auth.repository";
import { UserAuthAccessTokenEnum, UserAuthRefreshTokenEnum, } from "src/v1/api/user/dtos/user.auth.enum";
import { UserAuthIdentifierTransformerDto, UserAuthIdentifierEmailTransformerDto, UserAuthTransformerDto, UserTransformerDto, UserResetterTransformerDto, } from "src/v1/api/user/dtos/user.transformer.dto";
import { UserAuthDto, UserCreateValidatorDto, UserResetterUpdateValidatorDto, } from "src/v1/api/user/dtos/user.validator.dto";
import { plainToClass, } from "class-transformer";

@Injectable ()
/**
 * @class {UserAuthService}
 * @extends {AppService}
 */
export class UserAuthService extends AppService
{
    /**
     * @param {ConfigService} configService
     * @param {EventListenerService} eventListenerService
     * @param {I18nService} i18nService
     * @param {JwtService} jwtService
     * @param {CacheService} cacheService
     * @param {UserAuthRepository} userAuthRepository
     * @param {UrlHelper} urlHelper
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly eventListenerService: EventListenerService,
        protected readonly i18nService: I18nService,
        protected readonly jwtService: JwtService,
        @Inject (CACHE_MANAGER) protected readonly cacheService: CacheService,
        protected readonly userAuthRepository: UserAuthRepository,
        protected readonly urlHelper: UrlHelper
    )
    {
        super ();
    }

    /**
     * @param {Request} request
     * @param {Response} response
     * @returns {string | undefined}
     */
    public httpBearerToken (request: Request): string | undefined
    {
        const [type, token] = request?.headers?.authorization?.split (" ") ?? [];

        return type === "Bearer" ? token : undefined;
    }

    /**
     * @param {Socket} ws
     * @returns {string | undefined}
     */
    public wsBearerToken (ws: Socket): string | undefined
    {
        const [type, token] = ws?.handshake?.headers?.authorization?.split (" ") ?? [];

        return type === "Bearer" ? token : undefined;
    }

    /**
     * @returns {Promise<string[]>}
     */
    protected async tokens (): Promise<string[]>
    {
        return await this.cacheService.get ("tokens") ?? [];
    }

    /**
     * @param {string} token
     * @returns {Promise<boolean>}
     */
    public async checkToken (token: string): Promise<boolean>
    {
        const tokens: string[] = await this.tokens ();

        return tokens.includes (token);
    }

    /**
     * @param {string} token
     * @returns {Promise<void>}
     */
    public async addToken (token: string): Promise<void>
    {
        const

        tokens: string[] = await this.tokens (),
        ttl: number = this.configService.get<number> (
            "auth.signOptions.expiresIn"
        ) + this.configService.get<number> (
            "auth.refreshOptions.refreshExpiresIn"
        ) * 1000;

        tokens.push (token);
        await this.cacheService.set ("tokens", tokens, ttl);
    }

    /**
     * @param {string} token
     * @returns {Promise<void>}
     */
    public async removeToken (token: string): Promise<void>
    {
        const

        tokens: string[] = await this.tokens (),
        ttl: number = this.configService.get<number> (
            "auth.signOptions.expiresIn"
        ) + this.configService.get<number> (
            "auth.refreshOptions.refreshExpiresIn"
        ) * 1000;

        tokens.indexOf (token) !== -1 &&
        tokens.splice (tokens.indexOf (token), 1) &&
        await this.cacheService.set ("tokens", tokens, ttl);
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @returns {Promise<UserAuthTransformerDto>}
     */
    protected async attempt (
        { userId, }: UserAuthIdentifierTransformerDto
    ): Promise<UserAuthTransformerDto>
    {
        const payloadDto: { sub: string; } = {
            sub: userId,
        };
        const authDto: UserAuthTransformerDto = plainToClass (UserAuthTransformerDto, {
            accessTokenTtl: this.configService.get<number> (
                "auth.signOptions.expiresIn"
            ),
            refreshTokenTtl: this.configService.get<number> (
                "auth.refreshOptions.refreshExpiresIn"
            ),
            accessToken: await this.jwtService.signAsync ({
                scope: UserAuthAccessTokenEnum,
                expiresIn: this.configService.get<number> (
                    "auth.signOptions.expiresIn"
                ),
                ... payloadDto,
            }),
            refreshToken: await this.jwtService.signAsync ({
                scope: UserAuthRefreshTokenEnum,
                expiresIn: this.configService.get<number> (
                    "auth.refreshOptions.refreshExpiresIn"
                ),
                ... payloadDto,
            }),
        });

        await this.addToken (authDto.accessToken);
        await this.addToken (authDto.refreshToken);

        return authDto;
    }

    /**
     * @param {UserAuthDto} data
     * @returns {Promise<UserAuthTransformerDto | string>}
     */
    public async login (
        data: UserAuthDto
    ): Promise<UserAuthTransformerDto | string>
    {
        try {

            const userDto: UserTransformerDto | null = plainToClass (UserTransformerDto, await this.userAuthRepository.login (
                data
            ));
            const authDto: UserAuthTransformerDto = await this.attempt ({ userId: userDto.id, });

            if (authDto) this.eventListenerService.emit ("v1.user.auth.loggedin", new UserAuthLoggedInEvent (userDto));

            return authDto;

        } catch (error: any) {

            return error.message;
        }
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {string} token
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async logout (
        { userId, }: UserAuthIdentifierTransformerDto,
        token: string
    ): Promise<UserTransformerDto | string>
    {
        try {

            const dto: UserTransformerDto | null = plainToClass (UserTransformerDto, await this.userAuthRepository.logout (
                userId
            ))

            await this.removeToken (token);

            if (dto) this.eventListenerService.emit ("v1.user.auth.loggedout", new UserAuthLoggedOutEvent (dto));

            return dto;

        } catch (error: any) {

            return error.message;
        }
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {string} token
     * @returns {Promise<UserAuthTransformerDto | string>}
     */
    public async refresh (
        { userId, }: UserAuthIdentifierTransformerDto,
        token: string
    ): Promise<UserAuthTransformerDto | string>
    {
        try {

            const authDto: UserAuthTransformerDto = await this.attempt ({ userId, });

            await this.removeToken (token);

            if (authDto) this.eventListenerService.emit ("v1.user.auth.loggedout", new UserAuthRefreshedEvent ({ id: userId, }));

            return authDto;

        } catch (error: any) {

            return error.message;
        }
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async me (
        { userId, }: UserAuthIdentifierTransformerDto
    ): Promise<UserTransformerDto | string>
    {
        try {

            const dto: UserTransformerDto | null = plainToClass (UserTransformerDto, await this.userAuthRepository.me (
                userId
            ));

            return dto;

        } catch (error: any) {

            return error.message;
        }
    }

    /**
     * @param {UserCreateValidatorDto} data
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async register (
        data: UserCreateValidatorDto
    ): Promise<UserTransformerDto | string>
    {
        try {

            const dto: UserTransformerDto | null = plainToClass (UserTransformerDto, await this.userAuthRepository.register (
                data
            ));

            if (dto) this.eventListenerService.emit ("v1.user.auth.registered", new UserAuthRegisteredEvent (dto));

            return dto;

        } catch (error: any) {

            return error.message;
        }
    }

    /**
     * @param {UserAuthIdentifierEmailTransformerDto} userEmail
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async verify (
        { userEmail, }: UserAuthIdentifierEmailTransformerDto
    ): Promise<UserTransformerDto | string>
    {
        try {

            const dto: UserTransformerDto | null = plainToClass (UserTransformerDto, await this.userAuthRepository.verify (
                userEmail
            ));

            return dto;

        } catch (error: any) {

            return error.message;
        }
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @returns {Promise<string>}
     */
    public async reverify (
        { userId, }: UserAuthIdentifierTransformerDto
    ): Promise<string>
    {
        try {

            const dto: UserTransformerDto | null = plainToClass (UserTransformerDto, await this.userAuthRepository.reverify (
                userId
            ));

            if (dto) this.eventListenerService.emit ("v1.user.auth.reverify", new UserAuthRegisteredEvent (dto));

            return this.i18nService.t ("auth.verification-sent");

        } catch (error: any) {

            return error.message;
        }
    }

    /**
     * @param {UserResetterUpdateValidatorDto} data
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async reset (
        data: UserResetterUpdateValidatorDto
    ): Promise<UserTransformerDto | string>
    {
        try {

            const dto: UserTransformerDto | null = plainToClass (UserTransformerDto, await this.userAuthRepository.reset (
                data.token,
                data.email,
                data.password
            ));

            return dto;

        } catch (error: any) {

            return error.message;
        }
    }

    /**
     * @param {UserAuthIdentifierEmailTransformerDto} userEmail
     * @returns {Promise<string>}
     */
    public async forget (
        { userEmail, }: UserAuthIdentifierEmailTransformerDto
    ): Promise<string>
    {
        try {

            const userToken: string = this.urlHelper.ref ().sign (`${this.configService.get<string> ("app.frontendUrl")}/auth/reset-password/${userEmail}`);

            const dto: UserResetterTransformerDto | null = plainToClass (UserResetterTransformerDto, await this.userAuthRepository.forget (
                new URL (userToken).searchParams.get ("signed"),
                userEmail
            ));

            if (dto) this.eventListenerService.emit ("v1.user.auth.reset", new UserAuthResetEvent ({ ... dto, token: userToken, }));

            return this.i18nService.t ("passwords.sent");

        } catch (error: any) {

            return error.message;
        }
    }
}
