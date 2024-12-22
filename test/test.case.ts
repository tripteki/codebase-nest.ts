"use strict";

import { INestApplication, } from "@nestjs/common";
import { Test, TestingModule, } from "@nestjs/testing";
import { AppModule, } from "src/app/modules/app.module";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { HasherHelper, } from "src/app/helpers/hasher.helper";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import request, { Response, } from "supertest";
import { ulid, } from "ulid";

/**
 * @function {setupTestApp}
 * @returns {Promise<INestApplication>}
 */
export async function setupTestApp (): Promise<INestApplication>
{
    const appModule: TestingModule = await Test.createTestingModule (
    {
        imports: [ AppModule, ],
    }
    ).compile ();

    const app: INestApplication = appModule.createNestApplication ();

    await app.init ();

    return app;
};

/**
 * @function {setupAuthTestApp}
 * @param {INestApplication} app
 * @returns {Promise<string>}
 */
export async function setupAuthTestApp (app: INestApplication): Promise<{ accessToken: string; refreshToken: string }>
{
    const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
    const hasherHelper: HasherHelper = app.get (HasherHelper);
    const dateTimeHelper: DateTimeHelper = app.get (DateTimeHelper);

    const testUserEmail = "user@mail.com";

    const user = await prismaPostgreService.user.upsert ({
        where: { email: testUserEmail, },
        update: {
            password: await hasherHelper.hash ("12345678"),
            email_verified_at: dateTimeHelper.now (),
            deleted_at: null,
            updated_at: dateTimeHelper.now (),
        },
        create: {
            id: ulid (),
            name: `test-user-${ulid ()}`,
            email: testUserEmail,
            password: await hasherHelper.hash ("12345678"),
            email_verified_at: dateTimeHelper.now (),
            created_at: dateTimeHelper.now (),
            updated_at: dateTimeHelper.now (),
        },
    });

    const response: Response = await request (app.getHttpServer ())
    .post ("/v1/auth/login")
    .send ({
        identifierKey: "email",
        identifierValue: testUserEmail,
        password: "12345678",
    }).expect (201);

    return {
        accessToken: response.body.data?.accessToken || response.body.accessToken,
        refreshToken: response.body.data?.refreshToken || response.body.refreshToken,
    };
};

/**
 * @function {setdownTestApp}
 * @param {INestApplication} app
 * @returns {Promise<void>}
 */
export async function setdownTestApp (app: INestApplication): Promise<void>
{
    const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);

    const user = await prismaPostgreService.user.findUnique ({
        where: { email: "user@mail.com", },
    });

    if (user) {

        try {

            await prismaPostgreService.resetter.deleteMany ({
                where: { email: user.email, },
            });

            await prismaPostgreService.notification.deleteMany ({
                where: { user_id: user.id, },
            });

            await prismaPostgreService.user.delete ({
                where: { id: user.id, },
            });
        } catch (error) {

            //
        }
    }

    await app.close ();
};
