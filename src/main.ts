import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module.js';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { configureSwagger } from './config/swagger.config.js';
import { configureSession } from './config/session.config.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';

import { HttpErrorFilter } from './common/http-error-fillter.js';
import { validationExceptionFactory } from './common/validation-exception.factory.js';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api/v1');

  configureSession(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  configureSwagger(app);

  app.useGlobalFilters(new HttpErrorFilter());
  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();