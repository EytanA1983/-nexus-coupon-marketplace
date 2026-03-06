import { Router } from 'express';
import { authenticateAdmin } from '../middleware/authenticateAdmin';
import { prisma } from '../lib/prisma';
import { toPurchaseRecordDto } from '../dto/mappers';

export const adminPurchasesRouter = Router();

adminPurchasesRouter.use(authenticateAdmin);

adminPurchasesRouter.get('/', async (_req, res, next) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            productType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const dtos = purchases.map(toPurchaseRecordDto);
    res.json({ success: true, data: dtos });
  } catch (err) {
    next(err);
  }
});
