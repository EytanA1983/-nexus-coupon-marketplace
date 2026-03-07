import { Prisma, ProductType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { calculateMinimumSellPrice } from "../../utils/pricing";
import { toAdminProductDto } from "../../dto/mappers";
import { NotFoundError } from "../../errors";
import { ERROR_CODES } from "../../constants/errorCodes";

type CreateCouponProductInput = {
  name: string;
  description: string;
  image_url: string;
  cost_price: number;
  margin_percentage: number;
  value_type: "STRING" | "IMAGE";
  value: string;
};

type UpdateCouponProductInput = Partial<CreateCouponProductInput>;

export class AdminProductsService {
  async getAllProducts() {
    const products = await prisma.product.findMany({
      include: {
        coupon: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return products
      .filter((product) => product.coupon)
      .map((product) => toAdminProductDto(product));
  }

  async getProductById(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { coupon: true },
    });

    if (!product || !product.coupon) {
      throw new NotFoundError(
        "Product not found.",
        ERROR_CODES.PRODUCT_NOT_FOUND
      );
    }

    return toAdminProductDto(product);
  }

  async createCouponProduct(input: CreateCouponProductInput) {
    const minimumSellPrice = calculateMinimumSellPrice(
      input.cost_price,
      input.margin_percentage
    );

    const createdProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: input.name,
          description: input.description,
          type: ProductType.COUPON,
          imageUrl: input.image_url,
        },
      });

      await tx.coupon.create({
        data: {
          productId: product.id,
          costPrice: new Prisma.Decimal(input.cost_price),
          marginPercentage: new Prisma.Decimal(input.margin_percentage),
          minimumSellPrice: new Prisma.Decimal(minimumSellPrice),
          valueType: input.value_type,
          value: input.value,
          isSold: false,
        },
      });

      return tx.product.findUniqueOrThrow({
        where: { id: product.id },
        include: { coupon: true },
      });
    });

    return toAdminProductDto(createdProduct);
  }

  async updateCouponProduct(productId: string, input: UpdateCouponProductInput) {
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      include: { coupon: true },
    });

    if (!existing || !existing.coupon) {
      throw new NotFoundError(
        "Product not found.",
        ERROR_CODES.PRODUCT_NOT_FOUND
      );
    }

    const nextCostPrice =
      input.cost_price ?? Number(existing.coupon.costPrice);
    const nextMarginPercentage =
      input.margin_percentage ?? Number(existing.coupon.marginPercentage);

    const nextMinimumSellPrice = calculateMinimumSellPrice(
      nextCostPrice,
      nextMarginPercentage
    );

    const updatedProduct = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          name: input.name ?? existing.name,
          description: input.description ?? existing.description,
          imageUrl: input.image_url ?? existing.imageUrl,
        },
      });

      await tx.coupon.update({
        where: { productId },
        data: {
          costPrice:
            input.cost_price !== undefined
              ? new Prisma.Decimal(input.cost_price)
              : undefined,
          marginPercentage:
            input.margin_percentage !== undefined
              ? new Prisma.Decimal(input.margin_percentage)
              : undefined,
          minimumSellPrice: new Prisma.Decimal(nextMinimumSellPrice),
          valueType: input.value_type ?? undefined,
          value: input.value ?? undefined,
        },
      });

      return tx.product.findUniqueOrThrow({
        where: { id: productId },
        include: { coupon: true },
      });
    });

    return toAdminProductDto(updatedProduct);
  }

  async deleteProduct(productId: string) {
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      include: { coupon: true },
    });

    if (!existing || !existing.coupon) {
      throw new NotFoundError(
        "Product not found.",
        ERROR_CODES.PRODUCT_NOT_FOUND
      );
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return {
      success: true,
      deleted_product_id: productId,
    };
  }
}
