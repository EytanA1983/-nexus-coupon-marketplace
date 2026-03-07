import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../errors';
import { UserRole } from '@prisma/client';

export type JwtPayload = {
  sub: string;
  username: string;
  role: UserRole;
};

export function signAdminJwt(payload: JwtPayload): string {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  // jsonwebtoken v9 types expect expiresIn to be `ms`'s StringValue (not a generic `string`),
  // while env vars are always strings. We validate at runtime and cast for TS.
  const expiresIn = (env.JWT_EXPIRES_IN ?? '24h') as unknown as import('jsonwebtoken').SignOptions['expiresIn'];
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn,
    issuer: 'nexus-coupon-marketplace',
    audience: 'nexus-api',
  });
}

export function verifyJwt(token: string): JwtPayload {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      issuer: 'nexus-coupon-marketplace',
      audience: 'nexus-api',
    }) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired token', 'UNAUTHORIZED');
  }
}

