import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

export const SESSION_COOKIE_NAME = 'kart_nard.sid';

export function configureSession(app: NestExpressApplication): void {
  const secret = process.env.SESSION_SECRET;
  const databaseUrl = process.env.DATABASE_URL;
  const production = process.env.NODE_ENV === 'production';
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must have at least 32 characters');
  if (!databaseUrl) throw new Error('DATABASE_URL is missing');

  const origins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173').split(',').map(origin => origin.trim()).filter(Boolean);
  // Set only when actually deployed behind one trusted reverse proxy.
  if (production && process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
  app.enableCors({
    origin: origins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-CSRF-Protection'],
  });

  // Custom-header CSRF defense: a browser cannot send this header cross-origin
  // without an allowed CORS preflight. Also reject untrusted Origin values.
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.get('origin');
    if ((origin && !origins.includes(origin)) || req.get('X-CSRF-Protection') !== '1') {
      res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'CSRF validation failed',
        data: null,
      });
       return;
    }
    next();
  });

  const PgStore = connectPgSimple(session);
  app.use(session({
    name: SESSION_COOKIE_NAME,
    secret,
    store: new PgStore({ conString: databaseUrl, tableName: 'sessions', createTableIfMissing: false }),
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: production, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000, path: '/' },
  }));
}
