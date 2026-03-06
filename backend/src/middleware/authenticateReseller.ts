import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { UnauthorizedError } from '../errors';
import { env } from '../config/env';
import { bearerAuthHeaderSchema } from '../validators/http.validator';

/**
 * Reseller Bearer token authentication middleware.
 * Expects: Authorization: Bearer <token>
 *
 * Token is configured via env `RESELLER_API_TOKEN`.
 */
export function authenticateReseller(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const header = req.header('Authorization') ?? '';
    let token: string;
    try {
      token = bearerAuthHeaderSchema.parse(header);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new UnauthorizedError('Missing or invalid Bearer token', 'UNAUTHORIZED', {
          issues: err.issues,
        });
      }
      throw err;
    }

    if (!env.RESELLER_API_TOKEN) {
      throw new UnauthorizedError('Reseller authentication is not configured');
    }

    if (env.RESELLER_API_TOKEN !== token) {
      throw new UnauthorizedError('Invalid reseller token');
    }

    req.resellerToken = token;
    next();
  } catch (err) {
    next(err);
  }
}

