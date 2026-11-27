import { BadRequestException, ValidationError } from '@nestjs/common';

interface FieldError {
  field: string;
  message: string;
}

function toFieldErrors(errors: ValidationError[], parent = ''): FieldError[] {
  return errors.flatMap((e) => {
    const field = parent ? `${parent}.${e.property}` : e.property;
    const own = e.constraints
      ? [{ field, message: Object.values(e.constraints).join(', ') }]
      : [];
    return [...own, ...toFieldErrors(e.children ?? [], field)];
  });
}

export function validationExceptionFactory(errors: ValidationError[]) {
  return new BadRequestException({
    code: 'VALIDATION_FAILED',
    message: 'Request body is invalid',
    details: toFieldErrors(errors),
  });
}
