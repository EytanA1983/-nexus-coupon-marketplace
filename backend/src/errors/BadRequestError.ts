import { AppError } from './AppError';
import { ERROR_CODES } from '../constants/errorCodes';

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errorCode = ERROR_CODES.VALIDATION_ERROR, details?: unknown) {
    super(message, 400, errorCode, details);
  }
}
