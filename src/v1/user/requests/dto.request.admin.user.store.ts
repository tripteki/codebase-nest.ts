"use strict";

import { ApiProperty, } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength, } from "class-validator";
import { CommonRequestDto, } from "src/v1/common/requests/request";
import { IsNotExist, } from "src/v1/common/decorators/validator.isnotexist";
import { UserEntity, } from "src/v1/user/entities/entity.user";

/**
 * @class
 * @extends {CommonRequestDto}
 */
export class StoreUserAdminRequestDto extends CommonRequestDto
{
    @ApiProperty ({

        description: "The name of the user.",
        example: "John Doe",
    })
    @IsString ()
    @IsNotEmpty ()
    /**
     * @type {string}
     */
    public name: string;

    @ApiProperty ({

        description: "The email of the user.",
        example: "john.doe@example.com",
    })
    @IsEmail ()
    @IsNotEmpty ()
    @IsNotExist (UserEntity)
    /**
     * @type {string}
     */
    public email: string;

    @ApiProperty ({

        description: "The password of the user.",
        example: "password123",
    })
    @IsString ()
    @IsNotEmpty ()
    @MinLength (6)
    /**
     * @type {string}
     */
    public password: string;
};
