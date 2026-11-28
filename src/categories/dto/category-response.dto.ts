import { ApiProperty } from '@nestjs/swagger';
import type { Category } from '../category.model.js';

export class CategoryResponseDto {
  @ApiProperty({ example: 1 }) id!: number;
  @ApiProperty({ example: 'Board games' }) name!: string;
  @ApiProperty({ example: 'Games played on a board', nullable: true, type: String })
  description!: string | null;

  static from(c: Category): CategoryResponseDto {
    return { id: c.id, name: c.name, description: c.description };
  }
}