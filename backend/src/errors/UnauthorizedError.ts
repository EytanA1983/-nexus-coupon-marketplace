import { StatusCodes } from 'http-status-codes';
import { AppError } from './AppError';

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized.', errorCode = 'UNAUTHORIZED', details?: unknown) {
    super(message, StatusCodes.UNAUTHORIZED, errorCode, details);
  }
}
