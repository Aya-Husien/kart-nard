// src/common/swagger/error-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ErrorDetailDto {
  @ApiProperty({ example: 'name' }) field!: string;
  @ApiProperty({ example: 'must be unique' }) message!: string;
}

export class ErrorBodyDto {
  @ApiProperty({ example: 'VALIDATION_FAILED' }) code!: string;
  @ApiProperty({ example: 'Request body is invalid' }) message!: string;
  @ApiProperty({ type: [ErrorDetailDto] }) details!: ErrorDetailDto[];
}

export class ErrorResponseDto {
  @ApiProperty({ type: ErrorBodyDto }) error!: ErrorBodyDto;
}