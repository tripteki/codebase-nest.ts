import { INestApplication, } from "@nestjs/common";
import { App, } from "supertest/types";
import request from "supertest";
import Test from "supertest/lib/test";
import { setdownTestApp, setupTestApp, } from "test/test.case";

describe ("Status (e2e)", (): void =>
{
    let app: INestApplication<App>;

    beforeAll (async (): Promise<void> =>
    {
        app = await setupTestApp ();
    });

    afterAll (async (): Promise<void> =>
    {
        await setdownTestApp (app);
    });

    it ("status (GET)", (): Test => request (app.getHttpServer ())
    .get ("/status")
    .expect (200)
    .expect ((res): void =>
    {
        expect (res.body).toHaveProperty ("data");
        expect (res.body.data).toHaveProperty ("status");
        expect (res.body.data).toHaveProperty ("database");
        expect (res.body.data).toHaveProperty ("cache");
    }));

    it ("version (GET)", (): Test => request (app.getHttpServer ())
    .get ("/version")
    .expect (200)
    .expect ((res): void =>
    {
        expect (res.body).toHaveProperty ("data");
        expect (typeof res.body.data.version).toBe ("string");
    }));
});
