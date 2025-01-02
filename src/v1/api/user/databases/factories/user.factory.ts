import { Injectable, } from "@nestjs/common";
import { Prisma, } from "@prisma/postgre/client";
import { Factory, } from "src/app/databases/factories/app.factory";
import { FakerHelper, } from "src/app/helpers/faker.helper";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { HasherHelper, } from "src/app/helpers/hasher.helper";

@Injectable ()
/**
 * @class {UserFactory}
 * @implements {Factory<Prisma.UserCreateInput>}
 */
export class UserFactory implements Factory<Prisma.UserCreateInput>
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
     * @returns {Promise<Prisma.UserCreateInput>}
     */
    public async definition (): Promise<Prisma.UserCreateInput>
    {
        return {

            id: this.fakerHelper.ref ().string.uuid (),
            name: this.fakerHelper.ref ().internet.username (),
            email: this.fakerHelper.ref ().internet.email (),
            password: await this.hasherHelper.hash ("12345678"),
            email_verified_at: this.fakerHelper.ref ().date.recent (),
            created_at: this.dateTimeHelper.now (),
            updated_at: this.dateTimeHelper.now (),
        };
    }
}
