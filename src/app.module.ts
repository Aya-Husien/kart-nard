import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CoreModule } from './core.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AddressesModule } from './modules/addresses/addresses.module.js';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    AddressesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }