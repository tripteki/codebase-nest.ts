import { CallHandler, ExecutionContext, Injectable, NestInterceptor, } from "@nestjs/common";
import { Observable, } from "rxjs";
import { map, } from "rxjs/operators";

@Injectable ()
/**
 * @class {AppStringResponseInterceptor}
 * @implements {NestInterceptor}
 */
export class AppStringResponseInterceptor implements NestInterceptor
{
    /**
     * @param {ExecutionContext} _context
     * @param {CallHandler} next
     * @returns {Observable<unknown>}
     */
    public intercept (_context: ExecutionContext, next: CallHandler): Observable<unknown>
    {
        return next.handle ().pipe (map ((data: unknown): unknown =>
        {
            if (typeof data === "string") return new String (data);

            return data;
        }));
    }
}
