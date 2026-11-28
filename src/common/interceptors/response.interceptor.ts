import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<unknown> {
        const response = context
            .switchToHttp()
            .getResponse<Response>();

        return next.handle().pipe(
            map((result) => {
                const payload: Record<string, unknown> =
                    result == null
                        ? {}
                        : Array.isArray(result)
                            ? { items: result }
                            : typeof result === 'object'
                                ? result
                                : { value: result };

                const { message, ...data } = payload;

                return {
                    success: true,
                    statusCode: response.statusCode,
                    message:
                        typeof message === 'string'
                            ? message
                            : 'Request successful',
                    data: Object.keys(data).length ? data : null,
                };
            }),
        );
    }
}