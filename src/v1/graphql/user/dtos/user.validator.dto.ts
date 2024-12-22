import { IsDefined, IsOptional, IsIn, } from "class-validator";
import { InputType, Field, } from "@nestjs/graphql";

@InputType ()
/**
 * @class {UserAuthDto}
 */
export class UserAuthDto
{
    @Field (type => String)
    @IsDefined ()
    @IsIn ([ "email", "name", ])
    /**
     * @type {string}
     */
    identifierKey: string;

    @Field (type => String)
    @IsDefined ()
    /**
     * @type {string}
     */
    identifierValue: string;

    @Field (type => String)
    @IsDefined ()
    /**
     * @type {string}
     */
    password: string;
}
