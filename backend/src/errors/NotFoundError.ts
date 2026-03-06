import { StatusCodes } from 'http-status-codes';
import { AppError } from './AppError';

export class NotFoundError extends AppError {
  constructor(
    message = 'Resource not found.',
    errorCode = 'NOT_FOUND',
    details?: unknown
  ) {
    super(message, StatusCodes.NOT_FOUND, errorCode, details);
  }
}
