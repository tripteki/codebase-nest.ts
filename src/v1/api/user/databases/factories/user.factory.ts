import { hashSync, } from "bcrypt";
import { Factory, } from "src/v1/api/common/databases/factories/factory";
import { FakerHelper, } from "src/v1/api/common/helpers/faker.helper";

/**
 * @class UserFactory
 * @implements {Factory}
 */
export class UserFactory implements Factory
{
    /**
     * @returns { Promise<Record<string, string | Date> | null> }
     */
    public async definition (): Promise<Record<string, string | Date> | null>
    {
        return {

            id: FakerHelper.fake ().string.uuid (),
            name: FakerHelper.fake ().internet.username (),
            email: FakerHelper.fake ().internet.email (),
            password: hashSync ("12345678", 10),
            email_verified_at: FakerHelper.fake ().date.recent (),
            password_changed_at: FakerHelper.fake ().date.recent (),
        };
    }
}
