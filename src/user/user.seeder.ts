"use strict";

import { PrismaClient as PrismaPgsqlClient, } from "@prisma/pgsql/client";
import { userFactory, } from "./user.factory";

const pgsql = new PrismaPgsqlClient ();

/**
 * @returns {Promise<void>}
 */
export const userSeeder = async (): Promise<void> =>
{
    await pgsql.user.create (
    {
        data: userFactory (),
    });
};

/**
 * @returns {Promise<void>}
 */
export const userUnSeeder = async (): Promise<void> =>
{
    await pgsql.$disconnect ();
};
