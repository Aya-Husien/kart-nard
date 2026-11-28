import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(1, 50)
  @ApiProperty({ example: 'Test Customer', minLength: 1, maxLength: 50 })
  name!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  @ApiProperty({ example: 'customer@example.com', format: 'email', maxLength: 254 })
  email!: string;

  @IsString()
  @Length(8, 128)
  @ApiProperty({ example: 'ExamplePass123!', format: 'password', minLength: 8, maxLength: 128, writeOnly: true })
  password!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/)
  @MaxLength(10)
  @MinLength(10)
  @ApiProperty({ example: '+963991234567', pattern: '^\\+?[0-9]{7,15}$' })
  phone!: string;
}
