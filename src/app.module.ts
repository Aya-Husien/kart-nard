import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CoreModule } from './core.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { GamesModule } from './games/games.module.js';
import { GamesModule } from './games/games.module.js';

@Module({
  imports: [CoreModule, CategoriesModule, GamesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
