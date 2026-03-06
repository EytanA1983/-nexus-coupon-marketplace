import { prisma } from '../lib/prisma';
import { UnauthorizedError, NotFoundError } from '../errors';
import { verifyPassword } from '../utils/password';
import { signAdminJwt } from '../utils/jwt';

import { AdminLoginResponseDto } from '../dto/auth.dto';

export type AdminLoginResult = AdminLoginResponseDto;

export class AuthService {
  async adminLogin(username: string, password: string): Promise<AdminLoginResult> {
    const normalizedUsername = username.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { username: normalizedUsername } });
    if (!user) {
      throw new UnauthorizedError('Invalid username or password', 'UNAUTHORIZED');
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedError('Invalid username or password', 'UNAUTHORIZED');
    }

    if (user.role !== 'ADMIN') {
      throw new UnauthorizedError('Admin access required', 'FORBIDDEN');
    }

    const token = signAdminJwt({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    return { token };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, role: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    return user;
  }
}

