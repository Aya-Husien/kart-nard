import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNumber, Min, Max } from 'class-validator';

export class AddressLocationDto {
  @ApiProperty({ example: 33.5102, minimum: -90, maximum: 90 })
  @IsDefined()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({ example: 36.2784, minimum: -180, maximum: 180 })
  @IsDefined()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;
}
