import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Category } from './category.model.js';
import { CategoriesService } from './categories.service.js';

describe('CategoriesService', () => {
  let service: CategoriesService;
  const model = {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const mod = await Test.createTestingModule({
      providers: [CategoriesService, { provide: getModelToken(Category), useValue: model }],
    }).compile();
    service = mod.get(CategoriesService);
  });

  it('findAll sorts by name', async () => {
    model.findAll.mockResolvedValue([]);
    await service.findAll();
    expect(model.findAll).toHaveBeenCalledWith({ order: [['name', 'ASC']] });
  });

  it('findOne throws CATEGORY_NOT_FOUND when missing', async () => {
    model.findByPk.mockResolvedValue(null);
    await expect(service.findOne(9)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update applies dto on the found category', async () => {
    const update = vi.fn().mockResolvedValue({ id: 1, name: 'B' });
    model.findByPk.mockResolvedValue({ update });
    await service.update(1, { name: 'B' });
    expect(update).toHaveBeenCalledWith({ name: 'B' });
  });

  it('update throws 404 when missing', async () => {
    model.findByPk.mockResolvedValue(null);
    await expect(service.update(9, { name: 'B' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove resolves when a row was deleted', async () => {
    model.destroy.mockResolvedValue(1);
    await expect(service.remove(1)).resolves.toBeUndefined();
  });

  it('remove throws 404 when nothing was deleted', async () => {
    model.destroy.mockResolvedValue(0);
    await expect(service.remove(9)).rejects.toBeInstanceOf(NotFoundException);
  });
});