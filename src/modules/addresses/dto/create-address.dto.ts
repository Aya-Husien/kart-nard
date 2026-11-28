import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDefined, IsString, IsNotEmpty, MaxLength, IsObject, ValidateNested, IsOptional } from 'class-validator';
import { AddressLocationDto } from './address-location.dto.js';

export class CreateAddressDto {
  @ApiProperty({ example: 'Al-Mazzeh, Building 12, Floor 3', maxLength: 1000 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  address!: string;

  @ApiProperty({ example: 'Damascus', maxLength: 100 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @ApiProperty({ type: AddressLocationDto })
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressLocationDto)
  location!: AddressLocationDto;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'Call before delivery', maxLength: 1000 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string | null;
}
