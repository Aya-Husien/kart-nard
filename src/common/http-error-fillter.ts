
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import type { Response } from 'express';

import {
  UniqueConstraintError,
  ForeignKeyConstraintError,
  ValidationError,
} from 'sequelize';

interface ErrorBody {
  code?: string;
  message?: string | string[];
  details?: unknown[];
}

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();

    // 1. Unique Constraint
    if (exception instanceof UniqueConstraintError) {
      res.status(HttpStatus.CONFLICT).json({
        error: {
          code: 'ALREADY_EXISTS',
          message: 'Resource already exists',
          details: [],
        },
      });
      return;
    }

    // 2. Foreign Key Constraint
    if (exception instanceof ForeignKeyConstraintError) {
      res.status(HttpStatus.CONFLICT).json({
        error: {
          code: 'FOREIGN_KEY_CONFLICT',
          message: 'Related resource constraint violated',
          details: [],
        },
      });
      return;
    }

    // 3. Sequelize Validation
    if (exception instanceof ValidationError) {
      res.status(HttpStatus.BAD_REQUEST).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: [],
        },
      });
      return;
    }

    // 4. NestJS HTTP Exceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const raw = exception.getResponse();

      const body: ErrorBody =
        typeof raw === 'object' &&
        raw !== null &&
        !Array.isArray(raw)
          ? raw as ErrorBody
          : {};

      res.status(status).json({
        error: {
          code: body.code ?? HttpStatus[status] ?? 'HTTP_ERROR',
          message: body.message ?? exception.message,
          details: body.details ?? [],
        },
      });
      return;
    }

    // 5. Unknown / Internal Errors
    this.logger.error(
      exception instanceof Error
        ? exception.message
        : String(exception),
      exception instanceof Error
        ? exception.stack
        : undefined,
    );

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Unexpected error',
        details: [],
      },
    });
  }
}
