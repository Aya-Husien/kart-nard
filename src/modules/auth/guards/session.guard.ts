import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import '../session.types.js';
import { AuthService } from '../auth.service.js';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    if (!req.session?.userId) throw new UnauthorizedException();
    await this.auth.currentUser(req.session.userId);
    return true;
  }
}
