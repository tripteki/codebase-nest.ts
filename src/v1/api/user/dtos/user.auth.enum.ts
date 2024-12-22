import { SetMetadata, } from "@nestjs/common";

/**
 * @type {string}
 */
export const UserAuthAccessTokenEnum: string = "ACCESS_TOKEN";

/**
 * @type {string}
 */
export const UserAuthRefreshTokenEnum: string = "REFRESH_TOKEN";

/**
 * @type {MethodDecorator}
 */
export const UserAuthAccessTokenMetadataMiddleware = (): MethodDecorator => SetMetadata (UserAuthAccessTokenEnum, true);

/**
 * @type {MethodDecorator}
 */
export const UserAuthRefreshTokenMetadataMiddleware = (): MethodDecorator => SetMetadata (UserAuthRefreshTokenEnum, true);
