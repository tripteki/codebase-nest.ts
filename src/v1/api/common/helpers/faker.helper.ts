import configLocalization from "config/localization";

/**
 * @class FakerHelper
 */
export class FakerHelper
{
    /**
     * @returns { any }
     */
    public static fake (): any
    {
        const locale: string = Object (configLocalization._.factory ()).fallbackLang,
              faker = (lang: string) => require (`@faker-js/faker/locale/${lang}`);

        try {

            return faker (locale).faker;

        } catch (thrower: unknown) {

            return faker ("en").faker;
        }
    }
}
