git add src/config/swagger.config.ts

git commit -m "docs(api): configure Swagger documentation with session authentication"import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}
