import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor , ValidationPipe} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpErrorFilter } from './common/http-error-fillter.js';
import { validationExceptionFactory } from './common/validation-exception.factory.js';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors();
   app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
    
  );
  const config = new DocumentBuilder()
  .setTitle('Kart Nard API')
  .setDescription('API documentation')
  .setVersion('1.0')
  .build();

 const document = SwaggerModule.createDocument(app, config);
 SwaggerModule.setup('api/docs', app, document);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new HttpErrorFilter());
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
