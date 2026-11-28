import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing`);
  return value;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly from = required('MAIL_FROM');
  private readonly transporter = nodemailer.createTransport({
    host: required('SMTP_HOST'),
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    requireTLS: process.env.SMTP_SECURE !== 'true',
    auth: { user: required('SMTP_USER'), pass: required('SMTP_PASS') },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  async sendVerificationCode(email: string, otp: string): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection successful');

      const info = await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: 'Kart Nard – Verify your email',
        text: `Your verification code is ${otp}. It expires in 5 minutes. If you did not request it, ignore this email.`,
      });

      this.logger.log(`Email accepted by SMTP: ${info.messageId}`);
      
    } catch (error) {
      const err = error as Error & {
        code?: string;
        responseCode?: number;
        command?: string;
      };

      this.logger.error({
        message: err.message,
        code: err.code,
        responseCode: err.responseCode,
        command: err.command,
      });
    }
  }
}
