import { Injectable, Inject, } from "@intentjs/core";
import { ValidatorAccessDto, } from "src/v1/api/common/validators/validator.dto";
import { Service, } from "src/v1/api/common/services/service";
import { UserEntity, } from "src/v1/api/user/entities/user.entity";
import { UserAdminRepository, } from "src/v1/api/user/repositories/user.admin.repository";
import { UserTransformer, } from "src/v1/api/user/transformers/user.transformer";

/**
 * @class UserAdminService
 * @extends {Service}
 */
@Injectable ()
export class UserAdminService extends Service
{
    /**
     * @param { UserAdminRepository } userAdminRepository
     * @returns { void }
     */
    constructor (
        @Inject ("V1_USER_ADMIN_REPOSITORY") private readonly userAdminRepository: UserAdminRepository
    )
    {
        super ();
    }

    /**
     * @param { ValidatorAccessDto } userDto
     * @returns { Promise<Record<string, UserEntity>> }
     */
    public async all (
        userDto: ValidatorAccessDto
    ): Promise<Record<string, UserEntity>>
    {
        const userTransformer = new UserTransformer ();
        const userAdminRepository = await this.userAdminRepository.all (userDto, userTransformer);

        return await this.paginate (
            userAdminRepository,
            userTransformer
        );
    }
}
