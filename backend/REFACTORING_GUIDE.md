# Backend Refactoring Guide

## New Folder Structure

```
backend/src/
  config/
    env.ts
  constants/
    errorCodes.ts ✅
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
    auth.dto.ts ✅
    products.dto.ts ✅
    purchase.dto.ts ✅
    error.dto.ts ✅
  errors/
    AppError.ts ✅
    BadRequestError.ts ✅
    ConflictError.ts ✅
    NotFoundError.ts ✅
    UnauthorizedError.ts ✅
    errorMapper.ts ✅
    index.ts ✅
  lib/
    prisma.ts ✅
    express.d.ts
  middleware/
    authenticateAdmin.ts
    authenticateReseller.ts
    errorHandler.ts ✅
    notFoundHandler.ts ✅
    validateRequest.ts
    requestId.ts
    requestLogger.ts
    swagger.ts
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
    mappers.ts ✅
    password.ts
  validators/
    auth.validator.ts ✅
    product.validator.ts ✅
    purchase.validator.ts ✅
    params.validator.ts ✅
  app.ts
  server.ts
```

## Migration Steps

### ✅ Completed
- Created `constants/errorCodes.ts`
- Created `lib/prisma.ts`
- Created `utils/mappers.ts`
- Split error classes into separate files
- Created `dto/products.dto.ts`
- Created `validators/product.validator.ts` and `params.validator.ts`
- Updated `middleware/errorHandler.ts` and `notFoundHandler.ts`
- Updated `errors/errorMapper.ts`

### 🔄 Remaining Tasks

1. **Move Controllers**
   - `controllers/auth.controller.ts` → `controllers/admin/adminAuth.controller.ts`
   - `controllers/adminCoupon.controller.ts` → `controllers/admin/adminProducts.controller.ts`
   - `controllers/purchase.controller.ts` → Split into:
     - `controllers/customer/customerProducts.controller.ts`
     - `controllers/reseller/resellerProducts.controller.ts`
   - Create `controllers/admin/adminPurchases.controller.ts`

2. **Move Services**
   - `services/auth.service.ts` → `services/auth/adminAuth.service.ts`
   - `services/adminCoupon.service.ts` → `services/products/adminProducts.service.ts`
   - Create `services/products/publicProducts.service.ts`
   - `services/purchase.service.ts` → `services/purchases/purchase.service.ts`

3. **Move Repositories**
   - Create `repositories/auth.repository.ts`
   - `repositories/adminCoupon.repository.ts` → `repositories/products.repository.ts`
   - Create `repositories/purchases.repository.ts`

4. **Update Routes**
   - `routes/auth.routes.ts` → `routes/adminAuth.routes.ts`
   - `routes/admin.coupons.routes.ts` → `routes/adminProducts.routes.ts`
   - `routes/admin.purchases.routes.ts` → Keep as is
   - `routes/customer.products.routes.ts` → Keep as is
   - `routes/reseller.routes.ts` → `routes/resellerProducts.routes.ts`

5. **Update All Imports**
   - Update imports to use new paths
   - Update `config/prisma.ts` imports to `lib/prisma.ts`
   - Update `errors/errorCodes.ts` imports to `constants/errorCodes.ts`
   - Update `dto/mappers.ts` imports to `utils/mappers.ts`
   - Update error class imports to use `errors/index.ts`

## Import Changes

### Error Codes
```typescript
// Old
import { ErrorCodes } from '../errors/errorCodes';

// New
import { ErrorCodes } from '../constants/errorCodes';
```

### Prisma
```typescript
// Old
import { prisma } from '../config/prisma';

// New
import { prisma } from '../lib/prisma';
```

### Error Classes
```typescript
// Old
import { NotFoundError, BadRequestError } from '../errors/appError';

// New
import { NotFoundError, BadRequestError } from '../errors';
```

### Mappers
```typescript
// Old
import { toPublicProductDto } from '../dto/mappers';

// New
import { toPublicProductDto } from '../utils/mappers';
```

### DTOs
```typescript
// Old
import { AdminProductResponseDto } from '../dto/adminCoupon.dto';
import { PublicProductResponseDto } from '../dto/publicProduct.dto';

// New
import { AdminProductResponseDto, PublicProductResponseDto } from '../dto/products.dto';
```

### Validators
```typescript
// Old
import { createAdminCouponSchema, idParamSchema } from '../validators/adminCoupon.validator';

// New
import { createCouponProductSchema } from '../validators/product.validator';
import { productIdParamSchema } from '../validators/params.validator';
```
