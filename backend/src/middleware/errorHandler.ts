import { NextFunction, Request, Response } from 'express';
import { mapToAppError } from '../errors/errorMapper';

/**
 * Centralized error handler.
 * - Returns consistent JSON shape
 * - Avoids leaking stack traces in production
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const appErr = mapToAppError(err);
  const requestId = req.requestId;

  if (appErr.statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', err);
  }

  // Error format as per requirements:
  // {
  //   "error_code": "ERROR_NAME",
  //   "message": "Human readable message"
  // }
  res.status(appErr.statusCode).json({
    error_code: appErr.errorCode,
    message: appErr.message,
  });
}
