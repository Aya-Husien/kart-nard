import { Module } from '@nestjs/common';
import { databaseConfig } from './config/database.config.js';
import { envValidationSchema } from './config/env.validation.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      load: [databaseConfig],
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'postgres',
        uri: config.getOrThrow<string>('DATABASE_URL'),
        autoLoadModels: true,
        synchronize: false,
        logging: false,
      }),
    }),
  ],
})
export class CoreModule { }
