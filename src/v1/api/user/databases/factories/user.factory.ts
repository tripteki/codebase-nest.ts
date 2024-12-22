import { Injectable, } from "@nestjs/common";
import { Prisma as DatabasePrismaPostgreConstraint, } from "@prisma/client";
import { Factory, } from "src/app/databases/factories/app.factory";
import { FakerHelper, } from "src/app/helpers/faker.helper";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { HasherHelper, } from "src/app/helpers/hasher.helper";

@Injectable ()
/**
 * @class {UserFactory}
 * @implements {Factory<DatabasePrismaPostgreConstraint.UserCreateInput>}
 */
export class UserFactory implements Factory<DatabasePrismaPostgreConstraint.UserCreateInput>
{
    /**
     * @param {FakerHelper} fakerHelper
     * @param {DateTimeHelper} dateTimeHelper
     * @param {HasherHelper} hasherHelper
     * @returns {void}
     */
    constructor (
        private readonly fakerHelper: FakerHelper,
        private readonly dateTimeHelper: DateTimeHelper,
        private readonly hasherHelper: HasherHelper
    )
    {
        //
    }

    /**
     * @returns {Promise<DatabasePrismaPostgreConstraint.UserCreateInput>}
     */
    public async definition (): Promise<DatabasePrismaPostgreConstraint.UserCreateInput>
    {
        return {

            id: this.fakerHelper.ref ().string.ulid (),
            name: this.fakerHelper.ref ().internet.username (),
            email: this.fakerHelper.ref ().internet.email (),
            password: await this.hasherHelper.hash ("12345678"),
            email_verified_at: this.fakerHelper.ref ().date.recent (),
            created_at: this.dateTimeHelper.now (),
            updated_at: this.dateTimeHelper.now (),
        };
    }
}
