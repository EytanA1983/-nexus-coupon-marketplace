import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.preprocess((v) => Number(v), z.number().int().positive().default(3000)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().optional(),
  JWT_SECRET: z.string().min(16).optional(),
  JWT_EXPIRES_IN: z.string().optional(),
  RESELLER_API_TOKEN: z.string().optional()
});

export const env = envSchema.parse(process.env);

