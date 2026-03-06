import { StatusCodes } from 'http-status-codes';
import { AppError } from './AppError';

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden.', errorCode = 'FORBIDDEN', details?: unknown) {
    super(message, StatusCodes.FORBIDDEN, errorCode, details);
  }
}
