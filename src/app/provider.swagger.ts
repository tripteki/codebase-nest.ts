"use strict";

import { AppProvider, } from "src/app/provider";
import { SwaggerModule, DocumentBuilder as SwaggerBuilder, } from "@nestjs/swagger";

/**
 * @class
 * @extends {AppProvider}
 */
export class AppSwaggerProvider extends AppProvider
{
    /**
     * @returns {Promise<void>}
     */
    public async register (): Promise<void>
    {
        //
    }

    /**
     * @returns {Promise<void>}
     */
    public async boot (): Promise<void>
    {
        const

        swaggerService = SwaggerModule.createDocument (this.appService, ((new SwaggerBuilder ()).
            setTitle (this.configService.get<string> ("swagger.title")).
            setDescription (this.configService.get<string> ("swagger.description")).
            setVersion (this.configService.get<string> ("swagger.version"))
        .build ()));

        SwaggerModule.setup ("api/" + this.configService.get<string> ("swagger.path"),
            this.appService,
            swaggerService
        );
    }
};
