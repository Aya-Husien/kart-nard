import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponses } from '../common/swagger/api-error-responses.decorator.js';
import { CategoriesService } from './categories.service.js';
import { CategoryResponseDto } from './dto/category-response.dto.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories (sorted by name, not paginated)' })
  @ApiOkResponse({ type: [CategoryResponseDto] })
  async findAll(): Promise<CategoryResponseDto[]> {
    return (await this.categoriesService.findAll()).map(CategoryResponseDto.from);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by id' })
  @ApiOkResponse({ type: CategoryResponseDto })
  @ApiErrorResponses(400, 404)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CategoryResponseDto> {
    return CategoryResponseDto.from(await this.categoriesService.findOne(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  @ApiCreatedResponse({ type: CategoryResponseDto })
  @ApiErrorResponses(400, 409)
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return CategoryResponseDto.from(await this.categoriesService.create(dto));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a category' })
  @ApiOkResponse({ type: CategoryResponseDto })
  @ApiErrorResponses(400, 404, 409)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return CategoryResponseDto.from(await this.categoriesService.update(id, dto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a category (fails with 409 if games reference it)' })
  @ApiNoContentResponse({ description: 'Category deleted' })
  @ApiErrorResponses(400, 404, 409)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.categoriesService.remove(id);
  }
}