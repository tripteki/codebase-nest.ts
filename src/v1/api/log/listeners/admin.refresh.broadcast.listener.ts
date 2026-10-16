import { Inject, Injectable, } from "@nestjs/common";
import { OnEvent, } from "@nestjs/event-emitter";
import { ConfigService, } from "@nestjs/config";
import { JwtService, } from "@nestjs/jwt";
import { I18nService, } from "nestjs-i18n";
import { AppBroadcastNotificationListener, } from "src/app/listeners/app.broadcast.notification.listener";
import { UserRoleEnum, } from "src/v1/api/user/dtos/user.role.enum";
import { UserAuthService, } from "src/v1/api/user/services/user.auth.service";
import { UserAclRepository, } from "src/v1/api/user/repositories/user.acl.repository";

/**
 * @type {Record<string, string[]>}
 */
const SCOPE_PERMISSIONS: Record<string, string[]> = {
    users: [ "user.view", ],
    roles: [ "role.view", ],
    permissions: [ "permission.view", ],
    activities: [ "activity.view", ],
};

/**
 * @type {Record<string, string[]>}
 */
const SUBJECT_SCOPES: Record<string, string[]> = {
    User: [ "users", ],
    Role: [ "roles", ],
    Permission: [ "permissions", ],
    Setting: [],
};

@Injectable ()
/**
 * @class {AdminRefreshBroadcastListener}
 * @extends {AppBroadcastNotificationListener}
 */
export class AdminRefreshBroadcastListener extends AppBroadcastNotificationListener
{
    @Inject (UserAclRepository)
    /**
     * @type {UserAclRepository}
     */
    protected userAclRepository: UserAclRepository;

    /**
     * @param {ConfigService} configService
     * @param {I18nService} i18nService
     * @param {UserAuthService} userAuthService
     * @param {JwtService} jwtService
     * @returns {void}
     */
    constructor (
        configService: ConfigService,
        i18nService: I18nService,
        userAuthService: UserAuthService,
        jwtService: JwtService
    )
    {
        super (configService, i18nService, userAuthService, jwtService);
    }

    @OnEvent ("v1.admin.refresh")
    /**
     * @param {{ subjectType: string; causerId: string | null; }} event
     * @returns {Promise<void>}
     */
    public async handle (event: { subjectType: string; causerId: string | null; }): Promise<void>
    {
        if (! Object.prototype.hasOwnProperty.call (SUBJECT_SCOPES, event.subjectType)) return;

        const scopes = SUBJECT_SCOPES[event.subjectType];
        const permissionNames = new Set<string> ([ "activity.view", ]);

        for (const scope of scopes) {
            for (const permission of SCOPE_PERMISSIONS[scope] || []) permissionNames.add (permission);
        }

        const userIds = await this.userAclRepository.findUserIdsByPermissionNames (
            Array.from (permissionNames),
            [ UserRoleEnum.Superadmin, ]
        );

        for (const userId of userIds) {
            if (userId === event.causerId) continue;

            this.emitToUser (userId, "v1.admin.refresh", {
                userId,
                scopes,
            });
        }
    }
}
