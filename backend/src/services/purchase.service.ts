import { prisma } from '../lib/prisma';
import { PurchaseChannel, CouponValueType } from '@prisma/client';
import { BadRequestError, ConflictError, NotFoundError } from '../errors';
import { ERROR_CODES } from '../constants/errorCodes';

export type PurchaseResult = {
  purchaseId: string;
  productId: string;
  productName: string;
  channel: PurchaseChannel;
  finalPrice: number;
  purchasedAt: Date;
  // Coupon data for response
  couponValue: string;
  couponValueType: CouponValueType;
};

export class PurchaseService {
  /**
   * Direct Customer Purchase Flow:
   * 1. validate productId (done in route middleware)
   * 2. open transaction
   * 3. fetch coupon + product
   * 4. if not found → 404
   * 5. if sold → 409
   * 6. use minimum_sell_price as final price
   * 7. mark coupon sold (decrement stock)
   * 8. create purchase record
   * 9. commit (automatic)
   * 10. return coupon value (done in controller)
   */
  async purchaseAsCustomer(productId: string): Promise<PurchaseResult> {
    return prisma.$transaction(
      async (tx) => {
        // 3. Fetch coupon + product
        const product = await tx.product.findFirst({
          where: { id: productId, type: 'COUPON' },
          include: {
            coupon: true,
          },
        });

        // 4. if not found → 404
        if (!product || !product.coupon) {
          throw new NotFoundError('Product not found', ERROR_CODES.PRODUCT_NOT_FOUND);
        }

        const coupon = product.coupon;

        // 5. if sold → 409
        if (coupon.isSold) {
          throw new ConflictError('The product has already been sold.', ERROR_CODES.PRODUCT_ALREADY_SOLD);
        }

        // 6. use minimum_sell_price as final price
        const finalPrice = coupon.minimumSellPrice;

        // 7. mark coupon sold
        await tx.coupon.update({
          where: { productId: product.id },
          data: {
            isSold: true,
            soldAt: new Date(),
          },
        });

        // 8. create purchase record
        const purchase = await tx.purchase.create({
          data: {
            productId: product.id,
            channel: 'DIRECT_CUSTOMER',
            finalPrice,
          },
        });

        // 9. commit (automatic on transaction success)
        return {
          purchaseId: purchase.id,
          productId: product.id,
          productName: product.name,
          channel: purchase.channel,
          finalPrice: purchase.finalPrice.toNumber(),
          purchasedAt: purchase.purchasedAt,
          couponValue: coupon.value,
          couponValueType: coupon.valueType,
        };
      },
      { isolationLevel: 'Serializable', timeout: 10000 }
    );
  }

  /**
   * Reseller Purchase Flow:
   * 1. validate token (done in route middleware)
   * 2. validate productId (done in route middleware)
   * 3. validate body (done in route middleware)
   * 4. open transaction
   * 5. fetch coupon + product
   * 6. if not found → 404
   * 7. if sold → 409
   * 8. if reseller_price < minimum_sell_price → 400
   * 9. mark coupon sold (decrement stock)
   * 10. create purchase record
   * 11. commit (automatic)
   * 12. return coupon value (done in controller)
   */
  async purchaseAsReseller(
    productId: string,
    resellerPrice: number,
    resellerToken: string,
    resellerName?: string
  ): Promise<PurchaseResult> {
    // Additional validation (body validation done in middleware)
    if (!Number.isFinite(resellerPrice) || resellerPrice <= 0) {
      throw new BadRequestError('resellerPrice must be a positive number', ERROR_CODES.VALIDATION_ERROR);
    }

    // 4. Open transaction
    return prisma.$transaction(
      async (tx) => {
        // 5. Fetch coupon + product
        const product = await tx.product.findFirst({
          where: { id: productId, type: 'COUPON' },
          include: {
            coupon: true,
          },
        });

        // 6. if not found → 404
        if (!product || !product.coupon) {
          throw new NotFoundError('Product not found', ERROR_CODES.PRODUCT_NOT_FOUND);
        }

        const coupon = product.coupon;

        // 7. if sold → 409
        if (coupon.isSold) {
          throw new ConflictError('The product has already been sold.', ERROR_CODES.PRODUCT_ALREADY_SOLD);
        }

        // 8. if reseller_price < minimum_sell_price → 400
        const minPrice = coupon.minimumSellPrice.toNumber();
        if (resellerPrice < minPrice) {
          throw new BadRequestError(
            `Reseller price must be at least ${minPrice}`,
            ERROR_CODES.RESELLER_PRICE_TOO_LOW,
            { minimum_price: minPrice, provided_price: resellerPrice }
          );
        }

        // 9. mark coupon sold
        await tx.coupon.update({
          where: { productId: product.id },
          data: {
            isSold: true,
            soldAt: new Date(),
          },
        });

        // 10. create purchase record
        const purchase = await tx.purchase.create({
          data: {
            productId: product.id,
            channel: 'RESELLER',
            finalPrice: resellerPrice,
            resellerName: resellerName ?? null,
          },
        });

        // 11. commit (automatic on transaction success)
        return {
          purchaseId: purchase.id,
          productId: product.id,
          productName: product.name,
          channel: purchase.channel,
          finalPrice: purchase.finalPrice.toNumber(),
          purchasedAt: purchase.purchasedAt,
          couponValue: coupon.value,
          couponValueType: coupon.valueType,
        };
      },
      { isolationLevel: 'Serializable', timeout: 10000 }
    );
  }
}

