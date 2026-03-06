import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

/**
 * Attaches a requestId to each request for log correlation/tracing.
 * - Sets: req.requestId
 * - Adds response header: X-Request-Id
 */
export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = req.header('X-Request-Id') ?? randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
}

