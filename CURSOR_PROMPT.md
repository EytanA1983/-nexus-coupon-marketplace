# Cursor Prompt for Nexus Coupon Marketplace Backend

Use the following architecture and data contracts for the project.

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ProductType {
  COUPON
  DIGITAL
  PHYSICAL
}

enum UserRole {
  ADMIN
  RESELLER
  CUSTOMER
}

enum BuyerType {
  CUSTOMER
  RESELLER
}

enum PurchaseStatus {
  PENDING
  COMPLETED
  CANCELLED
}

enum CouponValueType {
  STRING
  IMAGE
}

model Product {
  id          String      @id @default(uuid())
  productType ProductType

  name        String
  description String?     @db.Text
  imageUrl    String?     @map("image_url") @db.VarChar(2048)

  // Pricing (use Decimal for money)
  costPrice        Decimal @db.Decimal(10, 2)
  marginPercentage Decimal @db.Decimal(5, 2)
  minimumSellPrice Decimal @db.Decimal(10, 2)
  currency         String  @default("USD") @db.VarChar(3)

  // Inventory & status
  stock         Int     @default(0)
  reservedStock Int     @default(0)
  isActive      Boolean @default(true)

  // Optional catalog fields
  sku      String?  @unique @db.VarChar(100)
  category String?  @db.VarChar(100)
  tags     String[] @default([])

  coupon Coupon?
  purchases Purchase[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("products")
  @@index([productType])
  @@index([isActive])
  @@index([createdAt])
}

model Coupon {
  id String @id @default(uuid())

  productId String  @unique
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  valueType CouponValueType @default(STRING) @map("value_type")
  value     String          @db.Text
  code      String?         @db.VarChar(255)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("coupons")
  @@index([productId])
}

model User {
  id String @id @default(uuid())

  email    String   @unique
  password String
  role     UserRole @default(CUSTOMER)

  purchases Purchase[] @relation("UserPurchases")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
  @@index([role])
}

model Purchase {
  id String @id @default(uuid())

  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Restrict)

  buyerType BuyerType
  customerUserId String?
  customerUser   User?   @relation("UserPurchases", fields: [customerUserId], references: [id], onDelete: SetNull)

  resellerTokenId String? @db.VarChar(64)
  resellerName    String? @db.VarChar(255)

  purchasePrice Decimal @db.Decimal(10, 2)
  couponValue Decimal? @db.Decimal(10, 2)

  status        PurchaseStatus @default(COMPLETED)
  transactionId String?        @unique
  notes         String?        @db.Text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("purchases")
  @@index([productId])
  @@index([buyerType])
  @@index([customerUserId])
  @@index([resellerTokenId])
  @@index([status])
  @@index([createdAt])
  @@index([productId, createdAt])
}
```

## Main Routes

- `POST /api/admin/auth/login` - Admin login (returns JWT)
- `POST /api/admin/products` - Create coupon product (JWT required)
- `GET /api/admin/products` - List all products (JWT required)
- `GET /api/admin/products/:productId` - Get product by ID (JWT required)
- `PUT /api/admin/products/:productId` - Update product (JWT required)
- `DELETE /api/admin/products/:productId` - Delete product (JWT required)
- `GET /api/admin/purchases` - List all purchases (JWT required)
- `GET /api/v1/products` - List products for resellers (Bearer token required)
- `GET /api/v1/products/:productId` - Get product for reseller (Bearer token required)
- `POST /api/v1/products/:productId/purchase` - Reseller purchase (Bearer token required)
- `GET /api/customer/products` - List products for customers (public)
- `GET /api/customer/products/:productId` - Get product for customer (public)
- `POST /api/customer/products/:productId/purchase` - Customer purchase (public)
- `GET /health` - Health check endpoint

## Error Codes

```typescript
export const ErrorCodes = {
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  PRODUCT_ALREADY_SOLD: 'PRODUCT_ALREADY_SOLD',
  RESELLER_PRICE_TOO_LOW: 'RESELLER_PRICE_TOO_LOW',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// Mapping to HTTP status codes:
// PRODUCT_NOT_FOUND → 404
// PRODUCT_ALREADY_SOLD → 409
// RESELLER_PRICE_TOO_LOW → 400
// UNAUTHORIZED → 401
// VALIDATION_ERROR → 400
// INTERNAL_ERROR → 500
```

## DTOs

### Auth DTOs
```typescript
export interface AdminLoginRequestDto {
  username: string;
  password: string;
}

export interface AdminLoginResponseDto {
  token: string;
}
```

### Product DTOs
```typescript
export interface CreateCouponProductRequestDto {
  name: string;
  description?: string;
  image_url?: string;
  cost_price: number;
  margin_percentage: number;
  value_type: 'STRING' | 'IMAGE';
  value: string;
  sku?: string;
  stock?: number;
  isActive?: boolean;
  category?: string;
  tags?: string[];
}

export interface UpdateCouponProductRequestDto {
  name?: string;
  description?: string;
  image_url?: string;
  cost_price?: number;
  margin_percentage?: number;
  value_type?: 'STRING' | 'IMAGE';
  value?: string;
  sku?: string;
  stock?: number;
  isActive?: boolean;
  category?: string;
  tags?: string[];
}

export interface AdminProductResponseDto {
  id: string;
  name: string;
  description: string;
  type: 'COUPON';
  image_url: string;
  cost_price: number;
  margin_percentage: number;
  minimum_sell_price: number;
  is_sold: boolean;
  sold_at: string | null;
  value_type: 'STRING' | 'IMAGE';
  value: string;
  created_at: string;
  updated_at: string;
}

export interface PublicProductResponseDto {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number; // Maps to minimum_sell_price
}
```

### Purchase DTOs
```typescript
export interface ResellerPurchaseRequestDto {
  reseller_price: number;
  reseller_name?: string;
}

export interface PurchaseSuccessResponseDto {
  product_id: string;
  final_price: number;
  value_type: 'STRING' | 'IMAGE';
  value: string;
}

export interface PurchaseRecordResponseDto {
  id: string;
  product_id: string;
  product_name: string;
  channel: 'DIRECT_CUSTOMER' | 'RESELLER';
  final_price: number;
  reseller_name: string | null;
  purchased_at: string;
}
```

## Zod Validation Schemas

```typescript
// auth.validator.ts
export const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// product.validator.ts
export const createCouponProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  image_url: z.string().url(),
  cost_price: z.number().min(0),
  margin_percentage: z.number().min(0),
  value_type: z.enum(['STRING', 'IMAGE']),
  value: z.string().min(1),
});

export const updateCouponProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  image_url: z.string().url().optional(),
  cost_price: z.number().min(0).optional(),
  margin_percentage: z.number().min(0).optional(),
  value_type: z.enum(['STRING', 'IMAGE']).optional(),
  value: z.string().min(1).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update.' }
);

// purchase.validator.ts
export const resellerPurchaseSchema = z.object({
  reseller_price: z.number().min(0),
  reseller_name: z.string().min(1).max(255).optional(),
});

// params.validator.ts
export const productIdParamSchema = z.object({
  productId: z.string().uuid(),
});
```

## Pricing Function

```typescript
export function calculateMinimumSellPrice(
  costPrice: number,
  marginPercentage: number
): number {
  return Number((costPrice * (1 + marginPercentage / 100)).toFixed(2));
}
```

## Important Rules

1. **minimumSellPrice** is calculated server-side only - never accept from client
2. **Coupon value** must never be exposed before successful purchase
3. **Reseller purchase** requires bearer token authentication
4. **Admin** uses JWT authentication
5. **Purchase flow** must be atomic (Serializable transaction) and prevent double-selling
6. Use **thin controllers**, **service layer**, **repository layer**
7. Use **Zod validation** for all inputs
8. Use **Prisma** for database access
9. Use **centralized error handling** with custom error classes
10. Use **DTO mappers** to convert Prisma models to DTOs

## Recommended Folder Structure

```
backend/src/
  config/
    env.ts
  constants/
    errorCodes.ts
  controllers/
    admin/
      adminAuth.controller.ts
      adminProducts.controller.ts
      adminPurchases.controller.ts
    customer/
      customerProducts.controller.ts
    reseller/
      resellerProducts.controller.ts
  dto/
    auth.dto.ts
    products.dto.ts
    purchase.dto.ts
    error.dto.ts
    mappers.ts
  errors/
    AppError.ts
    BadRequestError.ts
    ConflictError.ts
    NotFoundError.ts
    UnauthorizedError.ts
    errorMapper.ts
  lib/
    prisma.ts
  middleware/
    authenticateAdmin.ts
    authenticateReseller.ts
    errorHandler.ts
    notFoundHandler.ts
    validateRequest.ts
  repositories/
    auth.repository.ts
    products.repository.ts
    purchases.repository.ts
  routes/
    adminAuth.routes.ts
    adminProducts.routes.ts
    adminPurchases.routes.ts
    customerProducts.routes.ts
    resellerProducts.routes.ts
    index.ts
  services/
    auth/
      adminAuth.service.ts
    products/
      adminProducts.service.ts
      publicProducts.service.ts
    purchases/
      purchase.service.ts
  utils/
    jwt.ts
    pricing.ts
    password.ts
  validators/
    auth.validator.ts
    product.validator.ts
    purchase.validator.ts
    params.validator.ts
  app.ts
  server.ts
```

## Purchase Flow Logic

### Reseller Purchase:
1. validate token (middleware)
2. validate productId (middleware)
3. validate body (middleware)
4. open transaction (Serializable)
5. fetch coupon + product
6. if not found → 404
7. if sold → 409
8. if reseller_price < minimum_sell_price → 400
9. mark coupon sold (decrement stock)
10. create purchase record
11. commit
12. return coupon value

### Direct Customer Purchase:
1. validate productId (middleware)
2. open transaction (Serializable)
3. fetch coupon + product
4. if not found → 404
5. if sold → 409
6. use minimum_sell_price as final price
7. mark coupon sold (decrement stock)
8. create purchase record
9. commit
10. return coupon value

## Now Generate:

1. Backend file tree (verify structure matches above)
2. package.json with all dependencies
3. tsconfig.json
4. Prisma client setup (lib/prisma.ts)
5. app.ts (Express app setup with middleware)
6. server.ts (server startup)
7. Base route registration (routes/index.ts)
8. Health endpoint (/health)
9. Custom error classes (AppError, BadRequestError, ConflictError, NotFoundError, UnauthorizedError)
10. Centralized error middleware (errorHandler.ts with errorMapper.ts)

Generate the files in logical batches and keep imports consistent. Use the exact structure and naming conventions specified above.
