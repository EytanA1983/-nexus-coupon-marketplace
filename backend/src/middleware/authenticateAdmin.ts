import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ForbiddenError, UnauthorizedError } from '../errors';
import { verifyJwt } from '../utils/jwt';
import { bearerAuthHeaderSchema } from '../validators/http.validator';

/**
 * Admin JWT authentication middleware.
 * Expects: Authorization: Bearer <jwt>
 */
export function authenticateAdmin(req: Request, _res: Response, next: NextFunction) {
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

    const payload = verifyJwt(token);
    if (payload.role !== 'ADMIN') {
      throw new ForbiddenError('Admin access required');
    }
    // attach minimal identity for downstream use
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    next(err);
  }
}

