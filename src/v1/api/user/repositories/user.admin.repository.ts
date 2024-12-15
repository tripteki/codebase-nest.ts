import { Injectable, Pagination, } from "@intentjs/core";
import { ValidatorAccessDto, } from "src/v1/api/common/validators/validator.dto";
import { Repository, } from "src/v1/api/common/repositories/repository";
import { UserEntity, } from "src/v1/api/user/entities/user.entity";
import { UserTransformer, } from "src/v1/api/user/transformers/user.transformer";

/**
 * @class UserAdminRepository
 * @extends {Repository<UserEntity>}
 */
@Injectable ()
export class UserAdminRepository extends Repository<UserEntity>
{
    /**
     * @param { ValidatorAccessDto } userDto
     * @returns { Promise<Pagination<UserEntity>> }
     */
    public async all (
        userDto: ValidatorAccessDto,
        userTransformer: UserTransformer
    ): Promise<Pagination<UserEntity>>
    {
        const query = UserEntity.query ();

        return await super.accessAll ({
            query: () => query,
            dto: userDto,
            transformer: userTransformer,
        });
    }
}
