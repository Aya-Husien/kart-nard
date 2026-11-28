import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CoreModule } from './core.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { GamesModule } from './games/games.module.js';


@Module({
  imports: [
    CoreModule,
    AuthModule,
  CategoriesModule, GamesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }