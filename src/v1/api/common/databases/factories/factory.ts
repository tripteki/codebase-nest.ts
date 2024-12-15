/**
 * @interface Factory
 */
export interface Factory
{
    /**
     * @returns { Promise<Record<string, any>> }
     */
    definition (): Promise<Record<string, any>>
}
