import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export type AdminCouponCreateData = {
  name: string;
  description: string;
  imageUrl: string;
  costPrice: Decimal;
  marginPercentage: Decimal;
  minimumSellPrice: Decimal;
  valueType: 'STRING' | 'IMAGE';
  value: string;
};

export type AdminCouponUpdateData = Partial<AdminCouponCreateData>;

export class AdminCouponRepository {
  async list() {
    return prisma.product.findMany({
      where: { type: 'COUPON' },
      include: { coupon: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    return prisma.product.findFirst({
      where: { id, type: 'COUPON' },
      include: { coupon: true },
    });
  }

  async create(data: AdminCouponCreateData) {
    return prisma.product.create({
      data: {
        type: 'COUPON',
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        coupon: {
          create: {
            costPrice: data.costPrice,
            marginPercentage: data.marginPercentage,
            minimumSellPrice: data.minimumSellPrice,
            valueType: data.valueType,
            value: data.value,
            isSold: false,
          },
        },
      },
      include: { coupon: true },
    });
  }

  async update(id: string, data: AdminCouponUpdateData) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
        },
      });

      // Update coupon if pricing or value fields are provided
      if (
        data.costPrice !== undefined ||
        data.marginPercentage !== undefined ||
        data.minimumSellPrice !== undefined ||
        data.value !== undefined ||
        data.valueType !== undefined
      ) {
        await tx.coupon.update({
          where: { productId: product.id },
          data: {
            ...(data.costPrice !== undefined ? { costPrice: data.costPrice } : {}),
            ...(data.marginPercentage !== undefined ? { marginPercentage: data.marginPercentage } : {}),
            ...(data.minimumSellPrice !== undefined ? { minimumSellPrice: data.minimumSellPrice } : {}),
            ...(data.value !== undefined ? { value: data.value } : {}),
            ...(data.valueType !== undefined ? { valueType: data.valueType } : {}),
          },
        });
      }

      return tx.product.findFirst({
        where: { id: product.id, type: 'COUPON' },
        include: { coupon: true },
      });
    });
  }

  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  }

  async countPurchases(productId: string) {
    return prisma.purchase.count({ where: { productId } });
  }

  async getCompletedPurchaseStats(productId: string): Promise<{
    purchaseCount: number;
    totalRevenue: Decimal;
  }> {
    const agg = await prisma.purchase.aggregate({
      where: { productId },
      _count: { _all: true },
      _sum: { finalPrice: true },
    });

    return {
      purchaseCount: agg._count._all,
      totalRevenue: agg._sum.finalPrice ?? new Decimal(0),
    };
  }
}

