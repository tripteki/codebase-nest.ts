import { INestApplication, } from "@nestjs/common";
import { App, } from "supertest/types";
import request from "supertest";
import { setupTestApp, setupAuthTestApp, setdownTestApp, } from "test/test.case";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { USER_WEBPUSH_SUBSCRIBABLE_TYPE, } from "src/v1/api/user/dtos/user.webpush.enum";

describe ("WebPush (e2e)", (): void =>
{
    let app: INestApplication<App>;
    let token: string;
    let userId: string;

    beforeAll (async (): Promise<void> =>
    {
        app = await setupTestApp ();
        const tokens = await setupAuthTestApp (app);
        token = tokens.accessToken;

        const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
        const user = await prismaPostgreService.user.findUnique ({
            where: { email: "user@mail.com", },
        });

        userId = user?.id || "";
    });

    afterAll (async (): Promise<void> =>
    {
        await setdownTestApp (app);
    });

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

    describe ("POST /v1/webpush/subscribe", (): void =>
    {
        it ("should store push subscription for authenticated user", async (): Promise<void> =>
        {
            const response = await request (app.getHttpServer ())
            .post ("/v1/webpush/subscribe")
            .set ("Authorization", `Bearer ${token}`)
            .send ({
                endpoint: "https://push.example.test/subscription",
                keys: {
                    p256dh: "test-p256dh",
                    auth: "test-auth",
                },
            })
            .expect (200);

            expect (response.body.success).toBe (true);

            const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
            const subscription = await prismaPostgreService.pushSubscription.findFirst ({
                where: {
                    subscribable_id: userId,
                    subscribable_type: USER_WEBPUSH_SUBSCRIBABLE_TYPE,
                    endpoint: "https://push.example.test/subscription",
                },
            });

            expect (subscription).not.toBeNull ();
        });
    });

    describe ("POST /v1/webpush/unsubscribe", (): void =>
    {
        it ("should remove push subscription for authenticated user", async (): Promise<void> =>
        {
            const response = await request (app.getHttpServer ())
            .post ("/v1/webpush/unsubscribe")
            .set ("Authorization", `Bearer ${token}`)
            .send ({
                endpoint: "https://push.example.test/subscription",
            })
            .expect (200);

            expect (response.body.success).toBe (true);

            const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
            const subscription = await prismaPostgreService.pushSubscription.findFirst ({
                where: {
                    subscribable_id: userId,
                    endpoint: "https://push.example.test/subscription",
                },
            });

            expect (subscription).toBeNull ();
        });
    });
});
