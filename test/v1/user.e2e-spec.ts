import { INestApplication, } from "@nestjs/common";
import { App, } from "supertest/types";
import request from "supertest";
import Test from "supertest/lib/test";
import { setupTestApp, setupAuthTestApp, setdownTestApp, } from "test/test.case";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";

describe ("User (e2e)", (): void =>
{
    let app: INestApplication<App>;
    let token: string;
    let userId: string;

    beforeAll (async (): Promise<void> =>
    {
        app = await setupTestApp ();
        token = await setupAuthTestApp (app);

        const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);

        const user = await prismaPostgreService.user.findUnique ({
            where: { email: "user@mail.com", },
        });

        if (user) {

            userId = user.id;
        }
    });

    afterAll (async (): Promise<void> =>
    {
        await setdownTestApp (app);
    });

    describe ("User Auth", (): void =>
    {
        it ("auth me (GET)", (): Test => request (app.getHttpServer ())
        .get ("/v1/auth/me")
        .set ("Authorization", `Bearer ${token}`)
        .expect (200));
    });

    describe ("User Admin", (): void =>
    {
        it ("admin users index (GET)", (): Test => request (app.getHttpServer ())
        .get ("/v1/admin/users")
        .set ("Authorization", `Bearer ${token}`)
        .expect (200));

        it ("admin users show (GET)", (): Test => request (app.getHttpServer ())
        .get (`/v1/admin/users/${userId}`)
        .set ("Authorization", `Bearer ${token}`)
        .expect (200));

        it ("admin users store (POST)", (): Test => request (app.getHttpServer ())
        .post ("/v1/admin/users")
        .set ("Authorization", `Bearer ${token}`)
        .send ({
            name: `test-user-${Date.now ()}`,
            email: `test-${Date.now ()}@mail.com`,
            password: "12345678",
            password_confirmation: "12345678",
        })
        .expect (201));

        it ("admin users update (PUT)", async (): Promise<void> =>
        {
            await request (app.getHttpServer ())
            .put (`/v1/admin/users/${userId}`)
            .set ("Authorization", `Bearer ${token}`)
            .send ({
                name: `updated-user-${Date.now ()}`,
            })
            .expect (200);

            const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
            const dateTimeHelper: DateTimeHelper = app.get (DateTimeHelper);

            await prismaPostgreService.user.update ({
                where: { id: userId, },
                data: {
                    email_verified_at: dateTimeHelper.now (),
                },
            });
        });

        it ("admin users verify (PUT)", async (): Promise<void> =>
        {
            const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
            const dateTimeHelper: DateTimeHelper = app.get (DateTimeHelper);

            await prismaPostgreService.user.update ({
                where: { id: userId, },
                data: {
                    email_verified_at: dateTimeHelper.now (),
                },
            });

            await request (app.getHttpServer ())
            .put (`/v1/admin/users/verify/${userId}`)
            .set ("Authorization", `Bearer ${token}`)
            .expect (200);
        });

        it ("admin users deactivate (DELETE)", async (): Promise<void> =>
        {
            const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
            const dateTimeHelper: DateTimeHelper = app.get (DateTimeHelper);

            await prismaPostgreService.user.update ({
                where: { id: userId, },
                data: {
                    email_verified_at: dateTimeHelper.now (),
                    deleted_at: null,
                },
            });

            await request (app.getHttpServer ())
            .delete (`/v1/admin/users/deactivate/${userId}`)
            .set ("Authorization", `Bearer ${token}`)
            .expect (200);

            await prismaPostgreService.user.update ({
                where: { id: userId, },
                data: {
                    email_verified_at: dateTimeHelper.now (),
                },
            });
        });

        it ("admin users activate (DELETE)", async (): Promise<void> =>
        {
            const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
            const dateTimeHelper: DateTimeHelper = app.get (DateTimeHelper);

            await prismaPostgreService.user.update ({
                where: { id: userId, },
                data: {
                    deleted_at: null,
                    email_verified_at: dateTimeHelper.now (),
                },
            });

            await request (app.getHttpServer ())
            .delete (`/v1/admin/users/activate/${userId}`)
            .set ("Authorization", `Bearer ${token}`)
            .expect (200);
        });
    });
});
