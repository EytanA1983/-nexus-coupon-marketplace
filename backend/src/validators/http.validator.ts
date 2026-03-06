import { z } from 'zod';

/**
 * Parses an Authorization header in the form: "Bearer <token>".
 * Returns the token string (trimmed).
 */
export const bearerAuthHeaderSchema = z
  .string()
  .min(1)
  .refine((v) => v.toLowerCase().startsWith('bearer '), {
    message: 'Authorization header must be a Bearer token',
  })
  .transform((v) => v.slice('Bearer '.length).trim())
  .refine((token) => token.length > 0, { message: 'Bearer token is missing' });

