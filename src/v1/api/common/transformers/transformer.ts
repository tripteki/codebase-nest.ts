/**
 * @interface TransformerWithSortAndFilter
 */
export interface TransformerWithSortAndFilter
{
    /**
     * @returns { string[] }
     */
    sortables (): string[];

    /**
     * @returns { string[] }
     */
    filterables (): string[];
}
