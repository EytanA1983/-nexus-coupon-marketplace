import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { AppError } from './AppError';
import { BadRequestError } from './BadRequestError';
import { ConflictError } from './ConflictError';
import { NotFoundError } from './NotFoundError';
import { UnauthorizedError } from './UnauthorizedError';
import { ERROR_CODES } from '../constants/errorCodes';

/**
 * Central mapping of unknown errors -> AppError.
 * Ensures consistent HTTP status codes + stable error_code values.
 */
export function mapToAppError(err: unknown): AppError {
  // Already an operational AppError
  if (err instanceof AppError) {
    return err;
  }

  // Zod validation
  if (err instanceof ZodError) {
    return new BadRequestError('Validation error', ERROR_CODES.VALIDATION_ERROR, {
      issues: err.issues,
    });
  }

  // JSON parse errors from express.json()
  if (err instanceof SyntaxError && /JSON/i.test(err.message)) {
    return new BadRequestError('Invalid JSON body', 'INVALID_JSON');
  }

  // JWT errors
  if (
    err instanceof jwt.JsonWebTokenError ||
    err instanceof jwt.NotBeforeError ||
    err instanceof jwt.TokenExpiredError
  ) {
    return new UnauthorizedError('Invalid or expired token', ERROR_CODES.UNAUTHORIZED);
  }

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // https://www.prisma.io/docs/orm/reference/error-reference
    switch (err.code) {
      case 'P2002': // Unique constraint failed
        return new ConflictError('Unique constraint violation', 'UNIQUE_CONSTRAINT', {
          meta: err.meta,
        });
      case 'P2003': // Foreign key constraint failed
        return new BadRequestError('Invalid reference', 'FK_CONSTRAINT', {
          meta: err.meta,
        });
      case 'P2025': // Record not found
        return new NotFoundError('Record not found', 'RECORD_NOT_FOUND');
      default:
        return new AppError(
          'Database error',
          500,
          'DB_ERROR',
          { prismaCode: err.code, meta: err.meta }
        );
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return new BadRequestError('Database validation error', 'DB_VALIDATION_ERROR');
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return new AppError('Database initialization error', 500, 'DB_INIT_ERROR');
  }

  if (err instanceof Prisma.PrismaClientRustPanicError) {
    return new AppError('Database panic', 500, 'DB_PANIC');
  }

  // Fallback: unknown/unhandled errors
  return new AppError(
    'Internal Server Error',
    500,
    ERROR_CODES.INTERNAL_ERROR,
    process.env.NODE_ENV === 'development' ? { raw: (err as any)?.message } : undefined
  );
}
