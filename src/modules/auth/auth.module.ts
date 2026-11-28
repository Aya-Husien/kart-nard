import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThrottlerModule } from '@nestjs/throttler';
import { User } from '../users/models/user.model.js';
import { Role } from '../roles/models/role.model.js';
import { VerificationCode } from './models/verification-code.model.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { VerificationService } from './verification.service.js';
import { MailService } from './mail.service.js';
import { SessionGuard } from './guards/session.guard.js';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Role, VerificationCode]),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, VerificationService, MailService, SessionGuard],
  exports: [AuthService, SessionGuard],
})
export class AuthModule {}
