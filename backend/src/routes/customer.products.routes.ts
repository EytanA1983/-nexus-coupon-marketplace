import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { NotFoundError } from '../errors';
import { ERROR_CODES } from '../constants/errorCodes';
import { validateRequest } from '../middleware/validateRequest';
import { productIdParamSchema } from '../validators/product.validator';
import { customerPurchaseSchema } from '../validators/purchase.validator';
import { purchaseCustomerProduct } from '../controllers/customer/customerProducts.controller';
import { toPublicProductDto } from '../dto/mappers';

export const customerProductsRouter = Router();

customerProductsRouter.get('/', async (_req, res, next) => {
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

customerProductsRouter.get(
  '/:productId',
  validateRequest({ params: productIdParamSchema }),
  async (req, res, next) => {
    try {
      const id = req.params.productId as string;
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

// Customer purchase - no body, productId from URL
customerProductsRouter.post(
  '/:productId/purchase',
  validateRequest({ params: productIdParamSchema }),
  purchaseCustomerProduct
);