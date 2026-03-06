import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateReseller } from '../middleware/authenticateReseller';
import { NotFoundError } from '../errors';
import { ERROR_CODES } from '../constants/errorCodes';
import { purchaseResellerProduct } from '../controllers/reseller/resellerProducts.controller';
import { validateRequest } from '../middleware/validateRequest';
import { productIdParamSchema } from '../validators/product.validator';
import { resellerPurchaseSchema } from '../validators/purchase.validator';
import { toPublicProductDto } from '../dto/mappers';

export const resellerRouter = Router();

resellerRouter.use(authenticateReseller);

// Resellers can see minimumSellPrice (as "price"), but not costPrice, and not coupon value/code.
resellerRouter.get('/', async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        type: 'COUPON',
        coupon: {
          isSold: false,
        },
      },
      include: {
        coupon: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    const dtos = products.map(toPublicProductDto);
    res.json({ success: true, data: dtos });
  } catch (err) {
    next(err);
  }
});

resellerRouter.get(
  '/:productId',
  validateRequest({ params: productIdParamSchema }),
  async (req, res, next) => {
    try {
      const id = req.params.productId;
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          coupon: true,
        },
      });
      if (!product || product.type !== 'COUPON' || !product.coupon) {
        throw new NotFoundError('Product not found', ERROR_CODES.PRODUCT_NOT_FOUND);
      }
      const dto = toPublicProductDto(product);
      res.json({ success: true, data: dto });
    } catch (err) {
      next(err);
    }
  }
);

resellerRouter.post(
  '/:productId/purchase',
  validateRequest({ params: productIdParamSchema, body: resellerPurchaseSchema }),
  purchaseResellerProduct
);
