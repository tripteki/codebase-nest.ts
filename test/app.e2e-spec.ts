import { HttpStatus, } from "@nestjs/common";
import { FastifyAdapter, NestFastifyApplication, } from "@nestjs/platform-fastify";
import { Test, } from "@nestjs/testing";
import { AppModule, } from "../src/app.module";

describe ("AppController (e2e)", () =>
{
    let initialization: NestFastifyApplication;

    beforeAll (async () =>
    {
        const reference = await Test.createTestingModule ({

            imports: [

                AppModule,
            ],

        }).compile ();

        initialization = reference.createNestApplication<NestFastifyApplication> (new FastifyAdapter ());

        await initialization.init ();
        await initialization.getHttpAdapter ().getInstance ().ready ();
    });

    it ("Admin Index", () => initialization.inject (
    {
        method: "GET",
        url: "/admin",

    }).then ((result) => {

        expect (result.statusCode).toEqual (HttpStatus.OK);
    }));

    afterAll (async () => {

        await initialization.close ();
    });
});
