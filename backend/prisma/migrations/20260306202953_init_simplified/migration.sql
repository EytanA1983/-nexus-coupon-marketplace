-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('COUPON');

-- CreateEnum
CREATE TYPE "CouponValueType" AS ENUM ('STRING', 'IMAGE');

-- CreateEnum
CREATE TYPE "PurchaseChannel" AS ENUM ('DIRECT_CUSTOMER', 'RESELLER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN');

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ProductType" NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "product_id" TEXT NOT NULL,
    "cost_price" DECIMAL(10,2) NOT NULL,
    "margin_percentage" DECIMAL(10,2) NOT NULL,
    "minimum_sell_price" DECIMAL(10,2) NOT NULL,
    "is_sold" BOOLEAN NOT NULL DEFAULT false,
    "sold_at" TIMESTAMP(3),
    "value_type" "CouponValueType" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "channel" "PurchaseChannel" NOT NULL,
    "final_price" DECIMAL(10,2) NOT NULL,
    "reseller_name" TEXT,
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "purchases_product_id_key" ON "purchases"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
