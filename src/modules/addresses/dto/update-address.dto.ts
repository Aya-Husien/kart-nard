import { PartialType } from '@nestjs/swagger';
import { CreateAddressDto } from './create-address.dto.js';

// Undefined means unchanged; null is valid only for notes.
export class UpdateAddressDto extends PartialType(CreateAddressDto, {
  skipNullProperties: false,
}) {}
