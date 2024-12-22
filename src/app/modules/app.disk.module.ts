"use strict";

import { Request, Response, } from "express";
import { Module, } from "@nestjs/common";
import { ConfigModule, } from "@nestjs/config";
import { MulterModule, MulterModuleOptions, } from "@nestjs/platform-express";
import { ConfigService, } from "@nestjs/config";
import { diskStorage, } from "multer";
import { extname, } from "path";

@Module ({

    imports: [

        ConfigModule,

        MulterModule.registerAsync ({

            imports: [ ConfigModule, ],
            inject: [ ConfigService, ],

            useFactory: async (configService: ConfigService): Promise<MulterModuleOptions> => ({

                storage: diskStorage ({

                    destination: configService.get<string> ("storage.disks.private.path"),
                    filename: (
                        request: Request, file: Express.Multer.File,
                        callback: (
                            error: Error | null,
                            filename: string
                        ) => void): void =>
                    {
                        callback (null, `${Date.now ()}${extname (file.originalname)}`);
                    },
                }),
            }),
        }),
    ],

    exports: [

        MulterModule,
    ],
})
/**
 * @class {AppDiskModule}
 */
export class AppDiskModule
{
    //
};
