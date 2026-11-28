// categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './category.model.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category) private readonly categoryModel: typeof Category) {}

  findAll(): Promise<Category[]> {
    return this.categoryModel.findAll({ order: [['name', 'ASC']] });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryModel.findByPk(id);
    if (!category) this.throwNotFound(id);
    return category;
  }

  create(dto: CreateCategoryDto): Promise<Category> {
    return this.categoryModel.create({ ...dto });
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    return category.update({ ...dto });
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.categoryModel.destroy({ where: { id } });
    if (deleted === 0) this.throwNotFound(id);
  }

  private throwNotFound(id: number): never {
    throw new NotFoundException({
      code: 'CATEGORY_NOT_FOUND',
      message: `Category ${id} not found`,
    });
  }
}