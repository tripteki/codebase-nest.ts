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
    let refreshToken: string;
    let userId: string;

    beforeAll (async (): Promise<void> =>
    {
        app = await setupTestApp ();
        const tokens = await setupAuthTestApp (app);
        token = tokens.accessToken;
        refreshToken = tokens.refreshToken;

        const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);

        const user = await prismaPostgreService.user.findUnique ({
            where: { email: "user@mail.com", },
        });

        if (user) {
            userId = user.id;
        } else {
            throw new Error ("Test user should exist after setupAuthTestApp");
        }
    });

    afterAll (async (): Promise<void> =>
    {
        await setdownTestApp (app);
    });

    describe ("User Auth", (): void =>
    {
        beforeEach (async (): Promise<void> =>
        {
            const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
            const dateTimeHelper: DateTimeHelper = app.get (DateTimeHelper);

            const updateResult = await prismaPostgreService.user.updateMany ({
                where: { email: "user@mail.com", },
                data: {
                    email_verified_at: dateTimeHelper.now (),
                    deleted_at: null,
                },
            });

            if (updateResult.count === 0) {
                const hasherHelper = app.get ((await import ("src/app/helpers/hasher.helper")).HasherHelper);
                
                await prismaPostgreService.user.create ({
                    data: {
                        id: userId,
                        name: `test-user-recreated`,
                        email: "user@mail.com",
                        password: await hasherHelper.hash ("12345678"),
                        email_verified_at: dateTimeHelper.now (),
                        created_at: dateTimeHelper.now (),
                        updated_at: dateTimeHelper.now (),
                    },
                });
            }
        });

        it ("auth register (POST)", async (): Promise<void> =>
        {
            const timestamp = Date.now ();

            await request (app.getHttpServer ())
            .post ("/v1/auth/register")
            .send ({
                name: `test-register-${timestamp}`,
                email: `test-register-${timestamp}@mail.com`,
                password: "12345678",
                password_confirmation: "12345678",
            })
            .expect (201);
        });

        it ("auth login (POST)", async (): Promise<void> =>
        {
            const response = await request (app.getHttpServer ())
            .post ("/v1/auth/login")
            .send ({
                identifierKey: "email",
                identifierValue: "user@mail.com",
                password: "12345678",
            })
            .expect (201);

            expect (response.body).toHaveProperty ("accessToken");
            expect (response.body).toHaveProperty ("refreshToken");
            expect (response.body).toHaveProperty ("accessTokenTtl");
            expect (response.body).toHaveProperty ("refreshTokenTtl");
        });

        it ("auth me (GET)", (): Test => request (app.getHttpServer ())
        .get ("/v1/auth/me")
        .set ("Authorization", `Bearer ${token}`)
        .expect (200));

        it ("auth logout (POST)", async (): Promise<void> =>
        {
            await request (app.getHttpServer ())
            .post ("/v1/auth/logout")
            .set ("Authorization", `Bearer ${token}`)
            .expect (200);

            const tokens = await setupAuthTestApp (app);
            token = tokens.accessToken;
            refreshToken = tokens.refreshToken;
        });

        it ("auth refresh (PUT)", async (): Promise<void> =>
        {
            const response = await request (app.getHttpServer ())
            .put ("/v1/auth/refresh")
            .set ("Authorization", `Bearer ${refreshToken}`)
            .expect (200);

            expect (response.body).toHaveProperty ("accessToken");
            expect (response.body).toHaveProperty ("refreshToken");
        });

        it ("auth forgot-password (POST)", async (): Promise<void> =>
        {
            const response = await request (app.getHttpServer ())
            .post ("/v1/auth/forgot-password")
            .send ({
                email: "user@mail.com",
            })
            .expect (200);

            expect (typeof response.text).toBe ("string");
        });

        it ("auth reset-password (POST)", async (): Promise<void> =>
        {
            const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
            const dateTimeHelper: DateTimeHelper = app.get (DateTimeHelper);
            const hasherHelper = app.get ((await import ("src/app/helpers/hasher.helper")).HasherHelper);
            const UrlHelper = (await import ("src/app/helpers/url.helper")).UrlHelper;
            const urlHelper: any = app.get (UrlHelper);

            await prismaPostgreService.user.updateMany ({
                where: { email: "user@mail.com", },
                data: {
                    email_verified_at: dateTimeHelper.now (),
                    deleted_at: null,
                },
            });

            const testHost = "127.0.0.1:3000";
            const signedUrl = urlHelper.ref ().sign (`http://${testHost}/auth/reset-password/user@mail.com`);
            const signedToken = new URL (signedUrl).searchParams.get ("signed");

            await prismaPostgreService.resetter.upsert ({
                where: {
                    email: "user@mail.com",
                },
                update: {
                    token: signedToken,
                    created_at: new Date (),
                },
                create: {
                    email: "user@mail.com",
                    token: signedToken,
                    created_at: new Date (),
                },
            });

            const response = await request (app.getHttpServer ())
            .post (`/auth/reset-password/user@mail.com?signed=${signedToken}`)
            .set ("Host", testHost)
            .send ({
                password: "newpassword123",
                password_confirmation: "newpassword123",
            })
            .expect (200);

            expect (response.body).toHaveProperty ("id");
            expect (response.body).toHaveProperty ("email");

            await prismaPostgreService.user.updateMany ({
                where: { email: "user@mail.com", },
                data: { password: await hasherHelper.hash ("12345678"), },
            });
        });

        it ("auth verify-email (POST)", async (): Promise<void> =>
        {
            const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
            const dateTimeHelper: DateTimeHelper = app.get (DateTimeHelper);
            const UrlHelper = (await import ("src/app/helpers/url.helper")).UrlHelper;
            const urlHelper: any = app.get (UrlHelper);
            const { CACHE_MANAGER, } = await import ("@nestjs/cache-manager");

            await prismaPostgreService.user.updateMany ({
                where: { email: "user@mail.com", },
                data: {
                    email_verified_at: null,
                    deleted_at: null,
                },
            });

            const testHost = "127.0.0.1:3000";
            const signedUrl = urlHelper.ref ().sign (`http://${testHost}/auth/verify-email/user@mail.com`);
            const verifyToken = new URL (signedUrl).searchParams.get ("signed");

            const cacheService = app.get (CACHE_MANAGER);
            await cacheService.set (`verifier:user@mail.com`, verifyToken, 3600000);

            const response = await request (app.getHttpServer ())
            .post (`/auth/verify-email/user@mail.com?signed=${verifyToken}`)
            .set ("Host", testHost)
            .set ("Authorization", `Bearer ${token}`)
            .expect (200);

            expect (response.body).toHaveProperty ("id");
            expect (response.body.email_verified_at).not.toBeNull ();

            await prismaPostgreService.user.updateMany ({
                where: { email: "user@mail.com", },
                data: {
                    email_verified_at: dateTimeHelper.now (),
                },
            });
        });

        it ("auth email verification-notification (POST)", async (): Promise<void> =>
        {
            const response = await request (app.getHttpServer ())
            .post ("/v1/auth/email/verification-notification")
            .set ("Authorization", `Bearer ${token}`)
            .expect (200);

            expect (typeof response.text).toBe ("string");
            expect (response.text.length).toBeGreaterThan (0);
        });
    });

    describe ("User Admin", (): void =>
    {
        beforeEach (async (): Promise<void> =>
        {
            const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
            const dateTimeHelper: DateTimeHelper = app.get (DateTimeHelper);

            await prismaPostgreService.user.updateMany ({
                where: { email: "user@mail.com", },
                data: {
                    email_verified_at: dateTimeHelper.now (),
                    deleted_at: null,
                },
            });
        });

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

            await prismaPostgreService.user.updateMany ({
                where: { email: "user@mail.com", },
                data: {
                    email_verified_at: dateTimeHelper.now (),
                },
            });
        });

        it ("admin users verify (PUT)", async (): Promise<void> =>
        {
            const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
            const dateTimeHelper: DateTimeHelper = app.get (DateTimeHelper);

            await prismaPostgreService.user.updateMany ({
                where: { email: "user@mail.com", },
                data: {
                    email_verified_at: dateTimeHelper.now (),
                    deleted_at: null,
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

            await prismaPostgreService.user.updateMany ({
                where: { email: "user@mail.com", },
                data: {
                    email_verified_at: dateTimeHelper.now (),
                    deleted_at: null,
                },
            });

            await request (app.getHttpServer ())
            .delete (`/v1/admin/users/deactivate/${userId}`)
            .set ("Authorization", `Bearer ${token}`)
            .expect (200);

            await prismaPostgreService.user.updateMany ({
                where: { email: "user@mail.com", },
                data: {
                    email_verified_at: dateTimeHelper.now (),
                },
            });
        });

        it ("admin users activate (DELETE)", async (): Promise<void> =>
        {
            const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
            const dateTimeHelper: DateTimeHelper = app.get (DateTimeHelper);

            await prismaPostgreService.user.updateMany ({
                where: { email: "user@mail.com", },
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

        it ("admin users import (POST)", async (): Promise<void> =>
        {
            const csvContent = `name,email,password
test-import-1,import1@test.com,password123
test-import-2,import2@test.com,password123`;

            const buffer = Buffer.from (csvContent, "utf-8");

            const response = await request (app.getHttpServer ())
            .post ("/v1/admin/users/import")
            .set ("Authorization", `Bearer ${token}`)
            .attach ("file", buffer, "users.csv")
            .expect (200);

            expect (typeof response.text).toBe ("string");
        });

        it ("admin users export (POST)", async (): Promise<void> =>
        {
            const response = await request (app.getHttpServer ())
            .post ("/v1/admin/users/export")
            .set ("Authorization", `Bearer ${token}`)
            .send ({
                type: "csv",
            })
            .expect (200);

            expect (typeof response.text).toBe ("string");
            expect (response.text.length).toBeGreaterThan (0);
        });
    });
});
