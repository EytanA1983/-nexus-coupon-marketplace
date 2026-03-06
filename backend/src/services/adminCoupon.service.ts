import { Decimal } from '@prisma/client/runtime/library';
import { AdminCouponRepository } from '../repositories/adminCoupon.repository';
import { NotFoundError, ConflictError } from '../errors';
import { ERROR_CODES } from '../constants/errorCodes';
import { calculateMinimumSellPrice } from '../utils/pricing';
import { AdminProductResponseDto, CreateCouponProductRequestDto, UpdateCouponProductRequestDto } from '../dto/products.dto';
import { toAdminProductDto } from '../dto/mappers';
import { prisma } from '../lib/prisma';
import { PurchaseStatus } from '@prisma/client';

export type CreateAdminCouponInput = CreateCouponProductRequestDto;
export type UpdateAdminCouponInput = UpdateCouponProductRequestDto;

export class AdminCouponService {
  constructor(private readonly repo = new AdminCouponRepository()) {}

  async list(): Promise<AdminProductResponseDto[]> {
    const items = await this.repo.list();
    
    // is_sold and sold_at are now in coupon, not from purchase
    const dtos = items.map((item) => toAdminProductDto(item, null));
    
    return dtos;
  }

  async getById(id: string): Promise<AdminProductResponseDto> {
    const item = await this.repo.getById(id);
    if (!item) throw new NotFoundError('Coupon product not found', ERROR_CODES.PRODUCT_NOT_FOUND);
    
    // is_sold and sold_at are now in coupon, not from purchase
    return toAdminProductDto(item, null);
  }

  async create(input: CreateAdminCouponInput): Promise<AdminProductResponseDto> {
    const costPrice = new Decimal(input.cost_price);
    const marginPercentage = new Decimal(input.margin_percentage);
    const minimumSellPrice = new Decimal(
      calculateMinimumSellPrice(input.cost_price, input.margin_percentage)
    );

    const created = await this.repo.create({
      name: input.name,
      description: input.description ?? '',
      imageUrl: input.image_url ?? '',
      costPrice,
      marginPercentage,
      minimumSellPrice,
      valueType: input.value_type,
      value: input.value,
    });

    return toAdminProductDto(created, null);
  }

  async update(id: string, input: UpdateAdminCouponInput): Promise<AdminProductResponseDto> {
    const existing = await this.repo.getById(id);
    if (!existing || !existing.coupon) throw new NotFoundError('Coupon product not found', ERROR_CODES.PRODUCT_NOT_FOUND);

    const nextCostPrice =
      input.cost_price !== undefined ? new Decimal(input.cost_price) : existing.coupon.costPrice;
    const nextMargin =
      input.margin_percentage !== undefined
        ? new Decimal(input.margin_percentage)
        : existing.coupon.marginPercentage;

    // Recompute minimumSellPrice only when cost_price or margin_percentage changes
    const minimumSellPrice =
      input.cost_price !== undefined || input.margin_percentage !== undefined
        ? new Decimal(
            calculateMinimumSellPrice(nextCostPrice.toNumber(), nextMargin.toNumber())
          )
        : existing.coupon.minimumSellPrice;

    const updated = await this.repo.update(id, {
      name: input.name,
      description: input.description,
      imageUrl: input.image_url,
      costPrice: input.cost_price !== undefined ? nextCostPrice : undefined,
      marginPercentage: input.margin_percentage !== undefined ? nextMargin : undefined,
      minimumSellPrice: minimumSellPrice,
      value: input.value,
      valueType: input.value_type,
    });

    if (!updated) throw new NotFoundError('Coupon product not found', ERROR_CODES.PRODUCT_NOT_FOUND);
    
    return toAdminProductDto(updated, null);
  }

  async delete(id: string): Promise<{ message: string; softDeleted: boolean }> {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Coupon product not found', ERROR_CODES.PRODUCT_NOT_FOUND);

    const purchases = await this.repo.countPurchases(id);
    if (purchases > 0) {
      // Cannot delete if has purchases - just return error
      throw new ConflictError('Cannot delete coupon with existing purchases', ERROR_CODES.PRODUCT_ALREADY_SOLD);
    }

    await this.repo.delete(id);
    return { message: 'Coupon product deleted', softDeleted: false };
  }

  async getStats(id: string): Promise<{ purchaseCount: number; totalRevenue: string }> {
    // Ensure product exists and is COUPON
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Coupon product not found', ERROR_CODES.PRODUCT_NOT_FOUND);

    const stats = await this.repo.getCompletedPurchaseStats(id);
    return {
      purchaseCount: stats.purchaseCount,
      totalRevenue: stats.totalRevenue.toString(),
    };
  }
}

