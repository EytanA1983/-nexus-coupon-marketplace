import { Request, Response } from 'express';

/**
 * 404 Not Found handler
 * Error format as per requirements: { error_code, message }
 */
export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    error_code: 'ROUTE_NOT_FOUND',
    message: 'Route not found.',
  });
}
