/**
 * DTO Mapper Functions
 *
 * These functions convert Prisma models to DTOs, keeping controllers thin and clean.
 */

import type { Product, Coupon, Purchase } from '@prisma/client';
import { PublicProductResponseDto } from './publicProduct.dto';
import { AdminProductResponseDto } from './products.dto';
import { PurchaseSuccessResponseDto, PurchaseRecordResponseDto } from './purchase.dto';

type ProductWithPurchases = Product & {
  purchases: Purchase[];
};

type ProductWithCoupon = Product & {
  coupon: Coupon | null;
};

/**
 * Maps a Product to PublicProductResponseDto (for Customer and Reseller endpoints)
 * Only exposes public fields - hides cost_price, margin_percentage, minimum_sell_price, value
 * 
 * Returns ONLY: id, name, description, image_url, price
 * Must NOT return: cost_price, margin_percentage, coupon value
 */
export function toPublicProductDto(product: ProductWithCoupon): PublicProductResponseDto {
  const price = product.coupon?.minimumSellPrice.toNumber() || 0;
  
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    image_url: product.imageUrl,
    price,
  };
}

/**
 * Maps a Product with Coupon to AdminProductResponseDto
 * Includes all fields including sensitive pricing and coupon details
 */
export function toAdminProductDto(
  product: ProductWithCoupon,
  latestPurchase?: Purchase | null
): AdminProductResponseDto {
  if (!product.coupon) {
    throw new Error('Product must have a coupon');
  }

  const coupon = product.coupon;
  const isSold = coupon.isSold;
  const soldAt = coupon.soldAt?.toISOString() || null;

  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    type: 'COUPON',
    image_url: product.imageUrl || '',
    cost_price: coupon.costPrice.toNumber(),
    margin_percentage: coupon.marginPercentage.toNumber(),
    minimum_sell_price: coupon.minimumSellPrice.toNumber(),
    is_sold: isSold,
    sold_at: soldAt,
    value_type: coupon.valueType,
    value: coupon.value,
    created_at: product.createdAt.toISOString(),
    updated_at: product.updatedAt.toISOString(),
  };
}

/**
 * Maps a PurchaseResult to PurchaseSuccessResponseDto
 * Reveals coupon value after successful purchase
 */
export function toPurchaseSuccessDto(
  purchase: Purchase,
  coupon?: Coupon | null
): PurchaseSuccessResponseDto {
  if (!coupon) {
    throw new Error('Coupon is required for purchase success response');
  }

  return {
    product_id: purchase.productId,
    final_price: purchase.finalPrice.toNumber(),
    value_type: coupon.valueType,
    value: coupon.value,
  };
}

/**
 * Maps a Purchase with Product to PurchaseRecordResponseDto (for admin purchases endpoint)
 */
export function toPurchaseRecordDto(
  purchase: Purchase & { product: Product }
): PurchaseRecordResponseDto {
  return {
    id: purchase.id,
    product_id: purchase.productId,
    product_name: purchase.product.name,
    channel: purchase.channel,
    final_price: purchase.finalPrice.toNumber(),
    reseller_name: purchase.resellerName,
    purchased_at: purchase.purchasedAt.toISOString(),
  };
}
