import {
  ApiTags, ApiOperation, ApiBody, ApiCookieAuth,
  ApiCreatedResponse, ApiOkResponse, ApiBadRequestResponse,
  ApiUnauthorizedResponse, ApiForbiddenResponse, ApiConflictResponse, ApiResponse,
} from '@nestjs/swagger';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import './session.types.js';
import { AuthService } from './auth.service.js';
import { VerificationService } from './verification.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { EmailDto } from './dto/email.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { SESSION_COOKIE_NAME } from '../../config/session.config.js';
import { ApiResponseDto } from '../../common/dto/api-response.dto.js';

@ApiTags('Auth')
@ApiResponse({ status: 429, description: 'Too many requests' })
@Controller('auth')
@UseGuards(ThrottlerGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, validationError: { target: false, value: false } }))
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly verification: VerificationService) { }

  @ApiOperation({ summary: 'Register a customer and send an email OTP' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ type: ApiResponseDto, description: 'Account created; check your email' })
  @ApiBadRequestResponse({ description: 'Invalid registration data' })
  @ApiConflictResponse({ description: 'Email already registered' })
  @ApiForbiddenResponse({ description: 'CSRF validation failed' })
  @ApiCreatedResponse({ type: ApiResponseDto })
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
  ) {
    const result = await this.auth.register(dto);

    if (result.user) {
      await this.createSession(req, result.user.id);
    }

    return result;
  }

  @ApiOperation({ summary: 'Verify the email using a six-digit OTP' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiOkResponse({ type: ApiResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid or expired OTP, or invalid request data' })
  @ApiForbiddenResponse({ description: 'CSRF validation failed' })
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.verification.verify(dto.email, dto.otp);
  }

  @ApiOperation({ summary: 'Request another email verification code' })
  @ApiBody({ type: EmailDto })
  @ApiOkResponse({ type: ApiResponseDto, description: 'Generic response; a code is sent if eligible' })
  @ApiBadRequestResponse({ description: 'Invalid email' })
  @ApiForbiddenResponse({ description: 'CSRF validation failed' })
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  resendOtp(@Body() dto: EmailDto) {
    return this.verification.resend(dto.email);
  }

  @ApiOperation({ summary: 'Log in and create a server-side session' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    type: ApiResponseDto,
    description: 'Logged in; browser receives an HttpOnly session cookie',
    headers: { 'Set-Cookie': { description: 'Session cookie (kart_nard.sid)', schema: { type: 'string' } } },
  })
  @ApiBadRequestResponse({ description: 'Invalid request data' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  @ApiForbiddenResponse({ description: 'Account inactive, email not verified, or CSRF validation failed' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ) {
    const user = await this.auth.login(dto);

    await this.createSession(req, user.id);

    return { user };
  }

  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiCookieAuth()
  @ApiOkResponse({ type: ApiResponseDto })
  @ApiUnauthorizedResponse({ description: 'No valid authenticated session' })
  @Get('me')
  async me(@Req() req: Request) {
    if (!req.session?.userId) throw new UnauthorizedException();
    return { user: await this.auth.currentUser(req.session.userId) };
  }

  @ApiOperation({ summary: 'Destroy the current session and clear its cookie' })
  @ApiOkResponse({ type: ApiResponseDto, description: 'Logged out' })
  @ApiForbiddenResponse({ description: 'CSRF validation failed' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (req.session) await new Promise<void>((resolve, reject) => req.session.destroy(error => error ? reject(error) : resolve()));
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    return { message: 'Logged out' };
  }

  private async createSession(req: Request, userId: number) {
    await new Promise<void>((resolve, reject) =>
      req.session.regenerate(error =>
        error ? reject(error) : resolve(),
      ),
    );

    req.session.userId = userId;

    await new Promise<void>((resolve, reject) =>
      req.session.save(error =>
        error ? reject(error) : resolve(),
      ),
    );
  }
}
