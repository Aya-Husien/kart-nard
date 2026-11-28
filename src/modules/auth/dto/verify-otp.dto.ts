import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { EmailDto } from './email.dto.js';

export class VerifyOtpDto extends EmailDto {
  @IsString()
  @Matches(/^\d{6}$/)
  @ApiProperty({ example: '012345', pattern: '^[0-9]{6}$', minLength: 6, maxLength: 6, writeOnly: true })
  otp!: string;
}
