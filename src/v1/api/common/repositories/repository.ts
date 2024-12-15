import { Pagination, } from "@intentjs/core";
import { TransformerWithSortAndFilter, } from "src/v1/api/common/transformers/transformer";
import { ValidatorAccessDto, ValidatorAccessSortableDto, ValidatorAccessFilterableDto, } from "src/v1/api/common/validators/validator.dto";

/**
 * @class Repository<M>
 */
export class Repository<M>
{
    /**
     * @param { Function } query
     * @param { ValidatorAccessDto } dto
     * @returns { Promise<Pagination<M>> }
     */
    public async accessAll ({
        query,
        dto,
        transformer,
    }: {
        query: Function,
        dto: ValidatorAccessDto,
        transformer: TransformerWithSortAndFilter,
    }): Promise<Pagination<M>>
    {
        return await query ()
        .when (dto.sortables && transformer.sortables (), (queryBuilder: any): any => {
            dto.sortables.forEach ((sort: ValidatorAccessSortableDto) => { if (transformer.sortables ().includes (sort.field)) queryBuilder.orderBy (sort.field, sort.order); })
            return queryBuilder;
        })
        .when (dto.filterables && transformer.filterables (), (queryBuilder: any): any => {
            dto.filterables.forEach ((filter: ValidatorAccessFilterableDto) => { if (transformer.filterables ().includes (filter.field)) queryBuilder.whereILike (filter.field, `%${filter.search}%`); })
            return queryBuilder;
        })
        .paginate (
            dto.page,
            dto.perPage
        );
    }
}
