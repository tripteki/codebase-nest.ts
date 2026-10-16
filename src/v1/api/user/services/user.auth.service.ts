import { createHash, randomUUID, } from "crypto";
import { Request, } from "express";
import { Socket, } from "socket.io";
import { BadRequestException, ForbiddenException, HttpException, Injectable, Inject, NotFoundException, UnauthorizedException, UnprocessableEntityException, } from "@nestjs/common";
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
import { UserRoleEnum, } from "src/v1/api/user/dtos/user.role.enum";
import { UserAclRepository, } from "src/v1/api/user/repositories/user.acl.repository";
import { UserAuthRepository, } from "src/v1/api/user/repositories/user.auth.repository";
import { SecurityNotifier, } from "src/v1/api/user/support/security.notifier";
import { UserAuthAccessTokenEnum, UserAuthRefreshTokenEnum, } from "src/v1/api/user/dtos/user.auth.enum";
import { UserAuthIdentifierTransformerDto, UserAuthIdentifierEmailTransformerDto, UserAuthTransformerDto, UserTransformerDto, UserResetterTransformerDto, } from "src/v1/api/user/dtos/user.transformer.dto";
import { UserAuthDto, UserCreateValidatorDto, UserResetterUpdateValidatorDto, } from "src/v1/api/user/dtos/user.validator.dto";
import { plainToClass, } from "class-transformer";
import { unprocessableDetail, } from "src/app/http/app.validation.response";

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
     * @param {UserAclRepository} userAclRepository
     * @param {UrlHelper} urlHelper
     * @param {SecurityNotifier} securityNotifier
     * @returns {void}
     */
    constructor (
        protected readonly configService: ConfigService,
        protected readonly eventListenerService: EventListenerService,
        protected readonly i18nService: I18nService,
        protected readonly jwtService: JwtService,
        @Inject (CACHE_MANAGER) protected readonly cacheService: CacheService,
        protected readonly userAuthRepository: UserAuthRepository,
        protected readonly userAclRepository: UserAclRepository,
        protected readonly urlHelper: UrlHelper,
        protected readonly securityNotifier: SecurityNotifier
    )
    {
        super ();
    }

    /**
     * @param {{ id?: string; email?: string; name?: string }} user
     * @returns {Promise<string>}
     */
    protected async eventDisplayName (
        user: { id?: string; email?: string; name?: string }
    ): Promise<string>
    {
        const fallback = user?.email || user?.name || "";

        if (! user?.id) return fallback;

        return this.userAuthRepository.displayName (user.id, fallback);
    }

    /**
     * @param {Request} request
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
        const authToken = ws?.handshake?.auth?.token;

        if (typeof authToken === "string" && authToken) {
            return authToken;
        }

        const query = ws?.handshake?.query ?? {};
        const queryToken = query.token ?? query.access_token;
        const fromQuery = Array.isArray (queryToken) ? queryToken[0] : queryToken;

        if (typeof fromQuery === "string" && fromQuery) {
            return fromQuery;
        }

        const [type, token] = ws?.handshake?.headers?.authorization?.split (" ") ?? [];

        return type === "Bearer" && token ? token : undefined;
    }

    /**
     * @param {string} token
     * @returns {string}
     */
    protected tokenKey (token: string): string
    {
        return `tokens:${createHash ("sha256").update (token).digest ("hex")}`;
    }

    /**
     * @param {string} token
     * @returns {Promise<boolean>}
     */
    public async checkToken (token: string): Promise<boolean>
    {
        return Boolean (await this.cacheService.get (this.tokenKey (token)));
    }

    /**
     * @param {string} token
     * @returns {Promise<void>}
     */
    public async addToken (token: string): Promise<void>
    {
        const ttl: number = this.configService.get<number> (
            "auth.signOptions.expiresIn"
        ) + this.configService.get<number> (
            "auth.refreshOptions.refreshExpiresIn"
        ) * 1000;

        await this.cacheService.set (this.tokenKey (token), true, ttl);
    }

    /**
     * @param {string} token
     * @returns {Promise<void>}
     */
    public async removeToken (token: string): Promise<void>
    {
        await this.cacheService.del (this.tokenKey (token));
    }

    /**
     * @param {boolean | undefined} remember
     * @returns {boolean}
     */
    protected resolveRemember (remember?: boolean): boolean
    {
        return remember !== false;
    }

    /**
     * @param {boolean} remember
     * @returns {number}
     */
    protected refreshExpiresIn (remember: boolean): number
    {
        return remember
            ? this.configService.get<number> ("auth.refreshOptions.refreshExpiresIn")
            : this.configService.get<number> ("auth.refreshOptions.sessionRefreshExpiresIn");
    }

    /**
     * @param {UserAuthIdentifierTransformerDto} userId
     * @param {boolean} remember
     * @returns {Promise<UserAuthTransformerDto>}
     */
    protected async attempt (
        { userId, }: UserAuthIdentifierTransformerDto,
        remember: boolean = true
    ): Promise<UserAuthTransformerDto>
    {
        const payloadDto: { sub: string; } = {
            sub: userId,
        };
        const accessTokenTtl = this.configService.get<number> ("auth.signOptions.expiresIn");
        const refreshTokenTtl = this.refreshExpiresIn (remember);
        const authDto: UserAuthTransformerDto = plainToClass (UserAuthTransformerDto, {
            accessTokenTtl,
            refreshTokenTtl,
            accessToken: await this.jwtService.signAsync ({
                jti: randomUUID (),
                scope: UserAuthAccessTokenEnum,
                expiresIn: accessTokenTtl,
                ... payloadDto,
            }),
            refreshToken: await this.jwtService.signAsync ({
                jti: randomUUID (),
                scope: UserAuthRefreshTokenEnum,
                remember,
                expiresIn: refreshTokenTtl,
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

            if (! userDto?.email_verified_at) {
                throw new ForbiddenException ({
                    code: "email_not_verified",
                    message: this.i18nService.t ("_v1_user.auth.email_not_verified"),
                });
            }

            const authDto: UserAuthTransformerDto = await this.attempt (
                { userId: userDto.id, },
                this.resolveRemember (data.remember)
            );

            if (authDto && userDto) {
                userDto.name = await this.eventDisplayName (userDto);
                this.eventListenerService.emit ("v1.user.auth.loggedin", new UserAuthLoggedInEvent (userDto));
            }

            return authDto;

        } catch (error: any) {

            if (error instanceof HttpException && ! (error instanceof NotFoundException)) throw error;

            throw new UnauthorizedException (this.i18nService.t ("_v1_user.auth.invalid_credentials"));
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

            if (dto) {
                dto.name = await this.eventDisplayName (dto);
                this.eventListenerService.emit ("v1.user.auth.loggedout", new UserAuthLoggedOutEvent (dto));
            }

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

            const payload = await this.jwtService.verifyAsync (token, {
                secret: this.configService.get<string> ("auth.secret"),
            });
            const remember = this.resolveRemember (payload?.remember);
            const authDto: UserAuthTransformerDto = await this.attempt ({ userId, }, remember);

            await this.removeToken (token);

            if (authDto) this.eventListenerService.emit ("v1.user.auth.refreshed", new UserAuthRefreshedEvent ({ id: userId, }));

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
        if (data.password !== data.password_confirmation) {
            throw new UnprocessableEntityException (unprocessableDetail (this.i18nService.t ("_v1_user.auth.password_mismatch"), data));
        }

        try {

            if (await this.userAuthRepository.emailTaken (data.email)) {
                throw new BadRequestException (this.i18nService.t ("_v1_user.auth.email_already_exists"));
            }

            if (data.name && await this.userAuthRepository.nameTaken (data.name)) {
                throw new BadRequestException (this.i18nService.t ("_v1_user.auth.name_already_exists"));
            }

            const created = await this.userAuthRepository.register (data);

            if (created) await this.userAclRepository.assignDefaultUserRole (created.id);

            const safe = created ? { ... created, } as Record<string, unknown> : null;

            if (safe) {
                delete safe.password;
                delete safe.profile;
            }

            const dto: UserTransformerDto | null = safe
                ? plainToClass (UserTransformerDto, {
                    ... safe,
                    role: UserRoleEnum.User,
                    full_name: data.name ?? null,
                    avatar: null,
                    avatar_url: null,
                })
                : null;

            if (dto) {
                const eventUser = plainToClass (UserTransformerDto, { ... dto, });

                eventUser.name = await this.eventDisplayName (eventUser);
                this.eventListenerService.emit ("v1.user.auth.registered", new UserAuthRegisteredEvent (eventUser));
                this.eventListenerService.emit ("v1.admin.refresh", {
                    subjectType: "User",
                    causerId: dto.id,
                });
            }

            return dto;

        } catch (error: any) {

            if (error instanceof HttpException) throw error;

            return error.message;
        }
    }

    /**
     * @param {UserAuthIdentifierEmailTransformerDto} userEmail
     * @param {string | undefined} signed
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async verify (
        { userEmail, }: UserAuthIdentifierEmailTransformerDto,
        signed?: string
    ): Promise<UserTransformerDto | string>
    {
        try {

            const confirmed = await this.confirmEmailChange (userEmail, signed || "");

            if (confirmed) return confirmed;

            const user = await this.userAuthRepository.verify (userEmail);

            if (user) {
                this.eventListenerService.emit ("v1.user.registration.verified", { id: user.id, actorId: null, });
                this.eventListenerService.emit ("v1.admin.refresh", {
                    subjectType: "User",
                    causerId: user.id,
                });
            }

            return user ? plainToClass (UserTransformerDto, user) : user;

        } catch (error: any) {

            return error.message;
        }
    }

    /**
     * @param {string} newEmail
     * @param {string} signed
     * @returns {Promise<UserTransformerDto | null>}
     */
    public async confirmEmailChange (newEmail: string, signed: string): Promise<UserTransformerDto | null>
    {
        const key = `email-change:${(newEmail || "").trim ().toLowerCase ()}`;
        const raw = await this.cacheService.get<string> (key);

        if (! raw || ! signed) return null;

        const pending = JSON.parse (raw) as { user_id?: string; token?: string; };

        if (String (pending.token) !== String (signed) || ! pending.user_id) return null;

        await this.cacheService.del (key);

        const user = await this.userAuthRepository.findOneById (pending.user_id);

        if (! user) return null;

        if (await this.userAuthRepository.emailTaken (newEmail, user.id)) return null;

        const previousEmail = user.email;
        const updated = await this.userAuthRepository.changeEmail (user.id, newEmail.trim ());

        await this.securityNotifier.emailChanged (updated, previousEmail, false);
        this.eventListenerService.emit ("v1.admin.refresh", {
            subjectType: "User",
            causerId: updated.id,
        });

        return plainToClass (UserTransformerDto, updated);
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

            if (dto) {
                dto.name = await this.eventDisplayName (dto);
                this.eventListenerService.emit ("v1.user.auth.reverify", new UserAuthRegisteredEvent (dto));
            }

            return this.i18nService.t ("_v1_user.auth.verification_email_sent");

        } catch (error: any) {

            return error.message;
        }
    }

    /**
     * @param {string} email
     * @returns {Promise<string>}
     */
    public async reverifyByEmail (email: string): Promise<string>
    {
        const sent = this.i18nService.t ("_v1_user.auth.verification_email_sent");
        const user = await this.userAuthRepository.findOneByEmail (email);

        if (! user || user.email_verified_at) return sent;

        user.name = await this.eventDisplayName (user);
        this.eventListenerService.emit ("v1.user.auth.reverify", new UserAuthRegisteredEvent (user));

        return sent;
    }

    /**
     * @param {UserResetterUpdateValidatorDto} data
     * @returns {Promise<UserTransformerDto | string>}
     */
    public async reset (
        data: UserResetterUpdateValidatorDto
    ): Promise<UserTransformerDto | string>
    {
        if (data.password !== data.password_confirmation) {
            throw new UnprocessableEntityException (unprocessableDetail (this.i18nService.t ("_v1_user.auth.password_mismatch"), data));
        }

        try {

            const user = await this.userAuthRepository.reset (
                data.token,
                data.email,
                data.password
            );

            if (user) await this.securityNotifier.passwordChanged (user, null);

            return user ? plainToClass (UserTransformerDto, user) : user;

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
        const sent = this.i18nService.t ("_v1_user.auth.reset_link_sent");
        const existing = await this.userAuthRepository.findOneByEmail (userEmail);

        if (! existing) return sent;

        try {

            const userToken: string = this.urlHelper.ref ().sign (`${this.configService.get<string> ("app.frontendUrl")}/auth/reset-password/${userEmail}`);

            const dto: UserResetterTransformerDto | null = plainToClass (UserResetterTransformerDto, await this.userAuthRepository.forget (
                new URL (userToken).searchParams.get ("signed"),
                userEmail
            ));

            if (dto) {
                if (dto.user) dto.user.name = await this.eventDisplayName (dto.user);
                this.eventListenerService.emit ("v1.user.auth.reset", new UserAuthResetEvent ({ ... dto, token: userToken, }));
            }

            return sent;

        } catch (error: any) {

            return sent;
        }
    }
}
