import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../../services/auth.service';
import { AdminLoginBody } from '../../validators/auth.validator';

const authService = new AuthService();

export async function adminLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body as AdminLoginBody;
    const result = await authService.adminLogin(username, password);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
      });
    }
    const user = await authService.getMe(userId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
