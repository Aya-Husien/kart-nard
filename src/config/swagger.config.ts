import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SESSION_COOKIE_NAME } from './session.config.js';

export function configureSwagger(app: INestApplication): void {
  if (process.env.NODE_ENV === 'production') return;

  const config = new DocumentBuilder()
    .setTitle('Kart Nard API')
    .setDescription('Games Rental and Purchase API — session authentication')
    .setVersion('1.0')
    .addCookieAuth(SESSION_COOKIE_NAME)
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      withCredentials: true,
      requestInterceptor: (request: { method?: string; headers: Record<string, string> }) => {
        if (request.method?.toUpperCase() === 'POST') {
          request.headers['X-CSRF-Protection'] = '1';
        }
        return request;
      },
    },
  });
}
