import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      /** Correlation id for tracing a request across logs */
      requestId?: string;
      /** Authenticated user identity (admin only in this scaffold) */
      user?: {
        id: string;
        username: string;
        role: UserRole;
      };
      /** Reseller Bearer token (when authenticated via reseller middleware) */
      resellerToken?: string;
    }
  }
}

export {};

