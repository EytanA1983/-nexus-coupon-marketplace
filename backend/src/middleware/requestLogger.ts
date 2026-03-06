import morgan from 'morgan';
import { env } from '../config/env';

/**
 * HTTP request logging middleware.
 * Uses a more verbose format in development.
 */
morgan.token('requestId', (req) => (req as any).requestId ?? '-');

const format =
  env.NODE_ENV === 'development'
    ? ':method :url :status :res[content-length] - :response-time ms rid=:requestId'
    : ':remote-addr - :method :url :status :res[content-length] - :response-time ms rid=:requestId';

export const requestLogger = morgan(format);

