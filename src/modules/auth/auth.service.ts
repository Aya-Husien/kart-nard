import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { UniqueConstraintError } from 'sequelize';
import { hash, verify, argon2id } from 'argon2';
import { User } from '../users/models/user.model.js';
import { Role } from '../roles/models/role.model.js';
import { VerificationService } from './verification.service.js';
import { MailService } from './mail.service.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import { UserStatus } from '../users/enums/user-status.enum.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(User) private readonly users: typeof User,
    @InjectModel(Role) private readonly roles: typeof Role,
    private readonly verification: VerificationService,
    private readonly mail: MailService,
  ) { }

  async register(dto: RegisterDto) {
    const skipVerification =
      process.env.NODE_ENV === 'development' &&
      process.env.SKIP_EMAIL_VERIFICATION === 'true';

    const existingUser = await this.users.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const password = await hash(dto.password, { type: argon2id });

    try {
      const result = await this.sequelize.transaction(async (transaction) => {
        const role = await this.roles.findOne({
          where: { name: 'CUSTOMER' },
          transaction,
        });

        if (!role) {
          throw new InternalServerErrorException(
            'Customer role is not configured',
          );
        }

        const user = await this.users.create({
          name: dto.name,
          email: dto.email,
          password,
          phone: dto.phone,
          role_id: role.id,
          status: UserStatus.ACTIVE,
          email_verified_at: skipVerification ? new Date() : null,
        }, { transaction });

        const otp = skipVerification
          ? null
          : await this.verification.issue(user.id, transaction);

        return {
          otp,
          user: {
            id: user.id,
            name: user.name,
            role: role.name,
          },
        };
      });

      if (result.otp) {
        await this.mail.sendVerificationCode(dto.email, result.otp);

        return {
          message: 'Registration successful. Check your email.',
          user: null,
        };
      }

      return {
        message: 'Registration successful',
        user: {
          id: result.user.id,
          name: result.user.name,
          role: result.user.role,
        },
      };

    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('Email is already registered');
      }

      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { email: dto.email }, include: [Role] });
    if (!user) {
      // Similar password-processing cost for unknown accounts.
      await hash(dto.password, { type: argon2id });
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!(await verify(user.password, dto.password))) throw new UnauthorizedException('Invalid email or password');
    if (user.status !== UserStatus.ACTIVE) throw new ForbiddenException('Account is not active');
    if (!user.email_verified_at) throw new ForbiddenException('Email verification required');
    return this.publicUser(user);
  }

  async currentUser(userId: number) {
    const user = await this.users.findByPk(userId, { include: [Role] });
    if (!user || user.status !== UserStatus.ACTIVE || !user.email_verified_at) throw new UnauthorizedException();
    return this.publicUser(user);
  }

  private publicUser(user: User) {
    return { id: user.id, name: user.name, role: user.role.name, email: user.email, phone: user.phone };
  }
}
