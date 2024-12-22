"use strict";

import { INestApplication, } from "@nestjs/common";
import { Test, TestingModule, } from "@nestjs/testing";
import { AppModule, } from "src/app/modules/app.module";
import request, { Response, } from "supertest";

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
export async function setupAuthTestApp (app: INestApplication): Promise<string>
{
    const response: Response = await request (app.getHttpServer ())
    .post ("/v1/auth/login")
    .send ({
        identifierKey: "email",
        identifierValue: "user@mail.com",
        password: "12345678",
    }).expect (201);

    return response.body.accessToken;
};

/**
 * @function {setdownTestApp}
 * @param {INestApplication} app
 * @returns {Promise<void>}
 */
export async function setdownTestApp (app: INestApplication): Promise<void>
{
    await app.close ();
};
