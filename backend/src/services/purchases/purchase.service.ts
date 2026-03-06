import { Prisma, PurchaseChannel } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../errors/NotFoundError';
import { ConflictError } from '../../errors/ConflictError';
import { BadRequestError } from '../../errors/BadRequestError';
import { ERROR_CODES } from '../../constants/errorCodes';

type DirectPurchaseInput = {
  productId: string;
};

type ResellerPurchaseInput = {
  productId: string;
  resellerPrice: number;
};

type PurchaseResult = {
  product_id: string;
  final_price: number;
  value_type: 'STRING' | 'IMAGE';
  value: string;
};

export class PurchaseService {
  async purchaseDirectCustomer(input: DirectPurchaseInput): Promise<PurchaseResult> {
    return prisma.$transaction(async (tx) => {
      const productWithCoupon = await tx.product.findUnique({
        where: { id: input.productId },
        include: { coupon: true },
      });

      if (!productWithCoupon || !productWithCoupon.coupon) {
        throw new NotFoundError('Product not found.', ERROR_CODES.PRODUCT_NOT_FOUND);
      }

      if (productWithCoupon.coupon.isSold) {
        throw new ConflictError('The product has already been sold.', ERROR_CODES.PRODUCT_ALREADY_SOLD);
      }

      const minimumPrice = Number(productWithCoupon.coupon.minimumSellPrice);

      const updateResult = await tx.coupon.updateMany({
        where: {
          productId: input.productId,
          isSold: false,
        },
        data: {
          isSold: true,
          soldAt: new Date(),
        },
      });

      if (updateResult.count === 0) {
        throw new ConflictError('The product has already been sold.', ERROR_CODES.PRODUCT_ALREADY_SOLD);
      }

      await tx.purchase.create({
        data: {
          productId: input.productId,
          channel: PurchaseChannel.DIRECT_CUSTOMER,
          finalPrice: new Prisma.Decimal(minimumPrice),
        },
      });

      return {
        product_id: productWithCoupon.id,
        final_price: minimumPrice,
        value_type: productWithCoupon.coupon.valueType,
        value: productWithCoupon.coupon.value,
      };
    });
  }

  async purchaseReseller(input: ResellerPurchaseInput): Promise<PurchaseResult> {
    return prisma.$transaction(async (tx) => {
      const productWithCoupon = await tx.product.findUnique({
        where: { id: input.productId },
        include: { coupon: true },
      });

      if (!productWithCoupon || !productWithCoupon.coupon) {
        throw new NotFoundError('Product not found.', ERROR_CODES.PRODUCT_NOT_FOUND);
      }

      if (productWithCoupon.coupon.isSold) {
        throw new ConflictError('The product has already been sold.', ERROR_CODES.PRODUCT_ALREADY_SOLD);
      }

      const minimumPrice = Number(productWithCoupon.coupon.minimumSellPrice);

      if (input.resellerPrice < minimumPrice) {
        throw new BadRequestError(
          'Reseller price is lower than the minimum sell price.',
          ERROR_CODES.RESELLER_PRICE_TOO_LOW
        );
      }

      const updateResult = await tx.coupon.updateMany({
        where: {
          productId: input.productId,
          isSold: false,
        },
        data: {
          isSold: true,
          soldAt: new Date(),
        },
      });

      if (updateResult.count === 0) {
        throw new ConflictError('The product has already been sold.', ERROR_CODES.PRODUCT_ALREADY_SOLD);
      }

      await tx.purchase.create({
        data: {
          productId: input.productId,
          channel: PurchaseChannel.RESELLER,
          finalPrice: new Prisma.Decimal(input.resellerPrice),
        },
      });

      return {
        product_id: productWithCoupon.id,
        final_price: input.resellerPrice,
        value_type: productWithCoupon.coupon.valueType,
        value: productWithCoupon.coupon.value,
      };
    });
  }
}
