import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { UniqueConstraintError} from 'sequelize';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';
import { HttpErrorFilter } from '../common/http-error-fillter.js';
import { validationExceptionFactory } from '../common/validation-exception.factory.js';

describe('CategoriesController (HTTP)', () => {
  let app: INestApplication;
  const service = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: service }],
    }).compile();
    app = mod.createNestApplication();
    // نفس إعدادات main.ts
    app.useGlobalFilters(new HttpErrorFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: validationExceptionFactory,
      }),
    );
    await app.init();
  });

  afterAll(() => app.close());

  it('POST 201 returns the created category', async () => {
    service.create.mockResolvedValue({ id: 1, name: 'Board', description: null });
    const res = await request(app.getHttpServer()).post('/categories').send({ name: ' Board ' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, name: 'Board', description: null });
    expect(service.create).toHaveBeenCalledWith({ name: 'Board' }); // trimmed
  });

  it('POST 400 VALIDATION_FAILED on empty name and unknown fields', async () => {
    const res = await request(app.getHttpServer()).post('/categories').send({ name: '', foo: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(res.body.error.details.map((d: { field: string }) => d.field).sort()).toEqual(['foo', 'name']);
  });

  it('POST 409 ALREADY_EXISTS on duplicate name', async () => {
  const error = Object.assign(new UniqueConstraintError({}), {
    errors: [{ path: 'name', message: 'must be unique' }],
  });
  service.create.mockRejectedValue(error);

  const res = await request(app.getHttpServer()).post('/categories').send({ name: 'Board' });
  expect(res.status).toBe(409);
  expect(res.body.error.code).toBe('ALREADY_EXISTS');
  expect(res.body.error.details[0].field).toBe('name');
});

  it('GET /:id 404 with CATEGORY_NOT_FOUND', async () => {
    service.findOne.mockRejectedValue(
      new NotFoundException({ code: 'CATEGORY_NOT_FOUND', message: 'Category 9 not found' }),
    );
    const res = await request(app.getHttpServer()).get('/categories/9');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('GET /:id 400 on non-numeric id', async () => {
    const res = await request(app.getHttpServer()).get('/categories/abc');
    expect(res.status).toBe(400);
  });

  it('DELETE 204 has no body', async () => {
    service.remove.mockResolvedValue(undefined);
    const res = await request(app.getHttpServer()).delete('/categories/1');
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });
});