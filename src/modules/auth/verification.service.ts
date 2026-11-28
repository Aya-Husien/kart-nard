import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import type { Transaction } from 'sequelize';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { User } from '../users/models/user.model.js';
import { VerificationCode } from './models/verification-code.model.js';
import { MailService } from './mail.service.js';
import { UserStatus } from '../users/enums/user-status.enum.js';

const PURPOSE = 'EMAIL_VERIFICATION' as const;
const OTP_TTL = 5 * 60_000;
const RESEND_DELAY = 60_000;
const MAX_ATTEMPTS = 5;

@Injectable()
export class VerificationService {
  private readonly secret: string;

  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(User) private readonly users: typeof User,
    @InjectModel(VerificationCode) private readonly codes: typeof VerificationCode,
    private readonly mail: MailService,
  ) {
    const secret = process.env.OTP_SECRET;
    if (!secret || secret.length < 32) throw new Error('OTP_SECRET must have at least 32 characters');
    this.secret = secret;
  }

  private digest(userId: number, otp: string): string {
    return createHmac('sha256', this.secret).update(`${PURPOSE}:${userId}:${otp}`).digest('hex');
  }

  // Call inside a transaction while holding the user's row lock (or creating the user).
  async issue(userId: number, transaction: Transaction): Promise<string> {
    await this.codes.update({ invalidated_at: new Date() }, {
      where: { user_id: userId, type: PURPOSE, used_at: null, invalidated_at: null }, transaction,
    });
    const otp = randomInt(0, 1_000_000).toString().padStart(6, '0');
    await this.codes.create({
      user_id: userId, type: PURPOSE, code_hash: this.digest(userId, otp),
      expires_at: new Date(Date.now() + OTP_TTL), attempts: 0,
    }, { transaction });
    return otp;
  }

  async resend(email: string) {
    const otp = await this.sequelize.transaction(async (transaction) => {
      const user = await this.users.findOne({ where: { email }, transaction, lock: transaction.LOCK.UPDATE });
      if (!user || user.email_verified_at || user.status !== UserStatus.ACTIVE) return null;
      const latest = await this.codes.findOne({
        where: { user_id: user.id, type: PURPOSE }, order: [['created_at', 'DESC'], ['id', 'DESC']], transaction,
      });
      if (latest && Date.now() - latest.created_at.getTime() < RESEND_DELAY) return null;
      return this.issue(user.id, transaction);
    });
    if (otp) await this.mail.sendVerificationCode(email, otp);
    return { message: 'If eligible, a verification email will be sent.' };
  }

  async verify(email: string, otp: string) {
    const ok = await this.sequelize.transaction(async (transaction) => {
      const user = await this.users.findOne({ where: { email }, transaction, lock: transaction.LOCK.UPDATE });
      if (!user || user.email_verified_at || user.status !== UserStatus.ACTIVE) return false;
      const code = await this.codes.findOne({
        where: { user_id: user.id, type: PURPOSE, used_at: null, invalidated_at: null }, transaction,
      });
      if (!code || code.expires_at.getTime() <= Date.now() || code.attempts >= MAX_ATTEMPTS) return false;
      const expected = Buffer.from(code.code_hash, 'hex');
      const actual = Buffer.from(this.digest(user.id, otp), 'hex');
      if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
        const attempts = code.attempts + 1;
        await code.update({ attempts, ...(attempts >= MAX_ATTEMPTS ? { invalidated_at: new Date() } : {}) }, { transaction });
        return false; // Commit failed-attempt counter before throwing outside transaction.
      }
      const now = new Date();
      await code.update({ used_at: now }, { transaction });
      await user.update({ email_verified_at: now }, { transaction });
      return true;
    });
    if (!ok) throw new BadRequestException('Invalid or expired verification code');
    return { message: 'Email verified successfully' };
  }
}
