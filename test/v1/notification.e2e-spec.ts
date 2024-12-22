import { INestApplication, } from "@nestjs/common";
import { App, } from "supertest/types";
import request from "supertest";
import Test from "supertest/lib/test";
import { setupTestApp, setupAuthTestApp, setdownTestApp, } from "test/test.case";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { DateTimeHelper, } from "src/app/helpers/datetime.helper";
import { ulid, } from "ulid";

describe ("Notification (e2e)", (): void =>
{
    let app: INestApplication<App>;
    let token: string;
    let notificationId: string;

    beforeAll (async (): Promise<void> =>
    {
        app = await setupTestApp ();
        const tokens = await setupAuthTestApp (app);
        token = tokens.accessToken;

        const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
        const dateTimeHelper: DateTimeHelper = app.get (DateTimeHelper);

        const user = await prismaPostgreService.user.findUnique ({
            where: { email: "user@mail.com", },
        });

        if (user) {

            const notification = await prismaPostgreService.notification.create ({
                data: {
                    id: ulid (),
                    user_id: user.id,
                    type: "test",
                    data: { message: "Test notification", },
                    read_at: null,
                    created_at: dateTimeHelper.now (),
                    updated_at: dateTimeHelper.now (),
                },
            });

            notificationId = notification.id;
        }
    });

    afterAll (async (): Promise<void> =>
    {
        await setdownTestApp (app);
    });

    describe ("Notification User", (): void =>
    {
        it ("user notifications index (GET)", (): Test => request (app.getHttpServer ())
        .get ("/v1/notifications")
        .set ("Authorization", `Bearer ${token}`)
        .expect (200));

        it ("user notifications count (GET)", (): Test => request (app.getHttpServer ())
        .get ("/v1/notifications/count")
        .set ("Authorization", `Bearer ${token}`)
        .expect (200));

        it ("user notifications read-all (PUT)", (): Test => request (app.getHttpServer ())
        .put ("/v1/notifications/read-all")
        .set ("Authorization", `Bearer ${token}`)
        .expect (200));

        it ("user notifications read (PUT)", (): Test => request (app.getHttpServer ())
        .put (`/v1/notifications/read/${notificationId}`)
        .set ("Authorization", `Bearer ${token}`)
        .expect (200));

        it ("user notifications unread (GET)", async (): Promise<void> =>
        {
            const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
            const dateTimeHelper: DateTimeHelper = app.get (DateTimeHelper);

            const user = await prismaPostgreService.user.findUnique ({
                where: { email: "user@mail.com", },
            });

            if (user) {

                await prismaPostgreService.user.update ({
                    where: { id: user.id, },
                    data: {
                        email_verified_at: dateTimeHelper.now (),
                    },
                });
            }

            await request (app.getHttpServer ())
            .get ("/v1/notifications/unread")
            .set ("Authorization", `Bearer ${token}`)
            .expect (200);
        });

        it ("user notifications show (GET)", async (): Promise<void> =>
        {
            const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
            const dateTimeHelper: DateTimeHelper = app.get (DateTimeHelper);

            const user = await prismaPostgreService.user.findUnique ({
                where: { email: "user@mail.com", },
            });

            if (user) {

                await prismaPostgreService.user.update ({
                    where: { id: user.id, },
                    data: {
                        email_verified_at: dateTimeHelper.now (),
                    },
                });
            }

            await request (app.getHttpServer ())
            .get (`/v1/notifications/${notificationId}`)
            .set ("Authorization", `Bearer ${token}`)
            .expect (200);
        });

        it ("user notifications destroy (DELETE)", async (): Promise<void> =>
        {
            const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
            const dateTimeHelper: DateTimeHelper = app.get (DateTimeHelper);

            const user = await prismaPostgreService.user.findUnique ({
                where: { email: "user@mail.com", },
            });

            if (user) {

                await prismaPostgreService.user.update ({
                    where: { id: user.id, },
                    data: {
                        email_verified_at: dateTimeHelper.now (),
                        deleted_at: null,
                    },
                });
            }

            await request (app.getHttpServer ())
            .delete (`/v1/notifications/${notificationId}`)
            .set ("Authorization", `Bearer ${token}`)
            .expect (200);

            if (user) {

                await prismaPostgreService.user.update ({
                    where: { id: user.id, },
                    data: {
                        email_verified_at: dateTimeHelper.now (),
                        deleted_at: null,
                    },
                });

                const notification = await prismaPostgreService.notification.create ({
                    data: {
                        id: ulid (),
                        user_id: user.id,
                        type: "test",
                        data: { message: "Test notification for admin", },
                        read_at: null,
                        created_at: dateTimeHelper.now (),
                        updated_at: dateTimeHelper.now (),
                    },
                });

                notificationId = notification.id;
            }
        });
    });

    describe ("Notification Admin", (): void =>
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

        it ("admin notifications index (GET)", (): Test => request (app.getHttpServer ())
        .get ("/v1/admin/notifications")
        .set ("Authorization", `Bearer ${token}`)
        .expect (200));

        it ("admin notifications show (GET)", (): Test => request (app.getHttpServer ())
        .get (`/v1/admin/notifications/${notificationId}`)
        .set ("Authorization", `Bearer ${token}`)
        .expect (200));

        it ("admin notifications deactivate (DELETE)", (): Test => request (app.getHttpServer ())
        .delete (`/v1/admin/notifications/deactivate/${notificationId}`)
        .set ("Authorization", `Bearer ${token}`)
        .expect (200));

        it ("admin notifications activate (DELETE)", (): Test => request (app.getHttpServer ())
        .delete (`/v1/admin/notifications/activate/${notificationId}`)
        .set ("Authorization", `Bearer ${token}`)
        .expect (200));
    });
});
