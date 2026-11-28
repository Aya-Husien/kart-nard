// src/common/swagger/api-error-responses.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from './error-response.dto.js';

const DESCRIPTIONS: Record<number, string> = {
  400: 'Validation failed or malformed input',
  404: 'Resource not found',
  409: 'Conflict with existing data',
};

export const ApiErrorResponses = (...statuses: number[]) =>
  applyDecorators(
    ...statuses.map((status) =>
      ApiResponse({ status, description: DESCRIPTIONS[status], type: ErrorResponseDto }),
    ),
  );