import { Transformer, } from "@intentjs/core";
import { TransformerWithSortAndFilter, } from "src/v1/api/common/transformers/transformer";
import { UserEntity, } from "src/v1/api/user/entities/user.entity";

/**
 * @class UserTransformer
 * @extends {Transformer}
 * @implements {TransformerWithSortAndFilter}
 */
export class UserTransformer extends Transformer implements TransformerWithSortAndFilter
{
    /**
     * @returns { string[] }
     */
    public sortables (): string[]
    {
        return [

            "id",
            "name",
            "email",
            "created_at",
            "updated_at",
            "deleted_at",
        ];
    }

    /**
     * @returns { string[] }
     */
    public filterables (): string[]
    {
        return [

            "id",
            "name",
            "email",
            "created_at",
            "updated_at",
            "deleted_at",
        ];
    }

    /**
     * @param { UserEntity } userEntity
     * @returns { Promise<Record<string, string | Date> | null> }
     */
    public async transform (userEntity: UserEntity): Promise<Record<string, string | Date> | null>
    {
        return {

            id: userEntity.id,
            name: userEntity.name,
            email: userEntity.email,
            createdAt: userEntity.createdAt,
            updatedAt: userEntity.updatedAt,
            deletedAt: userEntity.deletedAt,
        };
    }
}
