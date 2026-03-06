import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, ProductType, CouponValueType, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

function calculateMinimumSellPrice(costPrice: number, marginPercentage: number): number {
  return Number((costPrice * (1 + marginPercentage / 100)).toFixed(2));
}

async function main(): Promise<void> {
  const adminPasswordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN
    },
    create: {
      username: "admin",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN
    }
  });

  const sampleCoupons = [
    {
      name: "Amazon $100 Coupon",
      description: "Digital Amazon gift coupon worth $100.",
      imageUrl: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop",
      costPrice: 80,
      marginPercentage: 25,
      valueType: CouponValueType.STRING,
      value: "AMZN-100-ABCD-1234"
    },
    {
      name: "Spotify Premium Coupon",
      description: "Redeemable Spotify Premium coupon.",
      imageUrl: "https://images.unsplash.com/photo-1611339555312-e607c8352fd7?q=80&w=1200&auto=format&fit=crop",
      costPrice: 30,
      marginPercentage: 20,
      valueType: CouponValueType.STRING,
      value: "SPOTIFY-PREM-5678"
    },
    {
      name: "Steam Wallet $50",
      description: "Steam wallet code worth $50.",
      imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
      costPrice: 38,
      marginPercentage: 25,
      valueType: CouponValueType.STRING,
      value: "STEAM-50-WXYZ-4321"
    },
    {
      name: "Cinema QR Pass",
      description: "One-time QR pass for cinema redemption.",
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
      costPrice: 40,
      marginPercentage: 15,
      valueType: CouponValueType.IMAGE,
      value: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=CINEMA-QR-2026-0001"
    }
  ];

  for (const coupon of sampleCoupons) {
    const existingProduct = await prisma.product.findFirst({
      where: { name: coupon.name }
    });

    if (existingProduct) {
      continue;
    }

    const product = await prisma.product.create({
      data: {
        name: coupon.name,
        description: coupon.description,
        type: ProductType.COUPON,
        imageUrl: coupon.imageUrl
      }
    });

    await prisma.coupon.create({
      data: {
        productId: product.id,
        costPrice: coupon.costPrice,
        marginPercentage: coupon.marginPercentage,
        minimumSellPrice: calculateMinimumSellPrice(
          coupon.costPrice,
          coupon.marginPercentage
        ),
        isSold: false,
        valueType: coupon.valueType,
        value: coupon.value
      }
    });
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
