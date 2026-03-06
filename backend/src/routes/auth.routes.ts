import { Router } from 'express';
import { adminLogin, me } from '../controllers/admin/adminAuth.controller';
import { authenticateAdmin } from '../middleware/authenticateAdmin';
import { validateRequest } from '../middleware/validateRequest';
import { adminLoginSchema } from '../validators/auth.validator';

export const authRouter = Router();

authRouter.post('/login', validateRequest({ body: adminLoginSchema }), adminLogin);
authRouter.get('/me', authenticateAdmin, me);

