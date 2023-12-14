"use strict";

import { PrismaClient as PrismaMongodbClient, } from "@prisma/mongodb/client";
import { PrismaClient as PrismaMysqlClient, } from "@prisma/mysql/client";
import { userFactory, } from "../factories/user.factory";

const
mongodb = new PrismaMongodbClient (),
mysql = new PrismaMysqlClient ();

/**
 * @returns {Promise<void>}
 */
(async (): Promise<void> => {

    await mysql.user.create ({

        data: userFactory (),
    });

}) ().finally (async () => {

    mysql.$disconnect ();
});
