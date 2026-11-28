import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { EmailDto } from './email.dto.js';

export class LoginDto extends EmailDto {
  @IsString()
  @Length(1, 128)
  @ApiProperty({ example: 'ExamplePass123!', format: 'password', minLength: 1, maxLength: 128, writeOnly: true })
  password!: string;
}
