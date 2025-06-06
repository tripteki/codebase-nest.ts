import { INestApplication, } from "@nestjs/common";
import { App, } from "supertest/types";
import request, { Response, } from "supertest";
import Test from "supertest/lib/test";
import { setupTestApp, setupAuthTestApp, setdownTestApp, } from "test/test.case";

describe ("User (e2e)", (): void =>
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

    it ("admin users index (GET)", (): Test => request (app.getHttpServer ())
    .get ("/v1/admin/users")
    .set ("Authorization", `Bearer ${token}`)
    .expect (200));
});
