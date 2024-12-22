import { SetMetadata, } from "@nestjs/common";

/**
 * @type {string}
 */
export const AuthAccessTokenEnum: string = "ACCESS_TOKEN";

/**
 * @type {string}
 */
export const AuthRefreshTokenEnum: string = "REFRESH_TOKEN";

/**
 * @type {MethodDecorator}
 */
export const AuthAccessTokenMetadata = (): MethodDecorator => SetMetadata (AuthAccessTokenEnum, true);

/**
 * @type {MethodDecorator}
 */
export const AuthRefreshTokenMetadata = (): MethodDecorator => SetMetadata (AuthRefreshTokenEnum, true);
