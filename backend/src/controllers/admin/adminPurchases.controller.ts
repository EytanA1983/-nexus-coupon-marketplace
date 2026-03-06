import { NextFunction, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { toPurchaseRecordDto } from '../../dto/mappers';

export async function listPurchases(_req: Request, res: Response, next: NextFunction) {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            type: true,
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
}
