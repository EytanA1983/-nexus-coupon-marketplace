import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { NotFoundError } from '../errors';
import { ERROR_CODES } from '../constants/errorCodes';
import { purchaseCustomerProduct } from '../controllers/customer/customerProducts.controller';
import { validateRequest } from '../middleware/validateRequest';
import { productIdParamSchema } from '../validators/params.validator';
import { toPublicProductDto } from '../dto/mappers';

const router = Router();

// GET /api/customer/products - List available products
router.get('/', async (_req, res, next) => {
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
    res.json(dtos);
  } catch (err) {
    next(err);
  }
});

// GET /api/customer/products/:productId - Get product details
router.get(
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
      res.json(dto);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/customer/products/:productId/purchase - Purchase product
router.post(
  '/:productId/purchase',
  validateRequest({ params: productIdParamSchema }),
  purchaseCustomerProduct
);

export default router;
