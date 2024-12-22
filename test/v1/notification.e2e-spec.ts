import { INestApplication, } from "@nestjs/common";
import { App, } from "supertest/types";
import request, { Response, } from "supertest";
import Test from "supertest/lib/test";
import { setupTestApp, setupAuthTestApp, setdownTestApp, } from "test/test.case";

describe ("Notification (e2e)", (): void =>
{
    let app: INestApplication<App>;
    let token: string;

    beforeAll (async (): Promise<void> =>
    {
        app = await setupTestApp ();
        token = await setupAuthTestApp (app);
    });

    afterAll (async (): Promise<void> =>
    {
        await setdownTestApp (app);
    });

    it ("admin notifications index (GET)", (): Test => request (app.getHttpServer ())
    .get ("/v1/admin/notifications")
    .set ("Authorization", `Bearer ${token}`)
    .expect (200));
});
