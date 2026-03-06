# Backend File Tree

```
backend/
├── .dockerignore
├── .env.example
├── Dockerfile
├── nodemon.json
├── package.json
├── tsconfig.json
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
└── src/
    ├── app.ts                    # Express app setup
    ├── server.ts                 # Server entry point
    │
    ├── config/
    │   ├── env.ts                # Environment variable validation
    │   ├── openapi.ts            # Swagger/OpenAPI configuration
    │   └── prisma.ts             # Prisma client singleton
    │
    ├── constants/
    │   └── index.ts              # Application constants (if needed)
    │
    ├── controllers/              # Thin HTTP request handlers
    │   ├── adminCoupon.controller.ts
    │   ├── auth.controller.ts
    │   └── purchase.controller.ts
    │
    ├── dto/                      # Data Transfer Objects
    │   └── adminCoupon.dto.ts
    │
    ├── errors/                   # Custom error classes
    │   ├── appError.ts           # Base error classes
    │   └── errorMapper.ts        # Error mapping logic
    │
    ├── lib/                      # Type augmentations
    │   └── express.d.ts          # Express Request type extensions
    │
    ├── middleware/
    │   ├── authenticateAdmin.ts
    │   ├── authenticateReseller.ts
    │   ├── errorHandler.ts
    │   ├── notFound.ts
    │   ├── requestId.ts
    │   ├── requestLogger.ts
    │   ├── swagger.ts
    │   └── validateRequest.ts
    │
    ├── repositories/             # Data access layer
    │   └── adminCoupon.repository.ts
    │
    ├── routes/
    │   ├── index.ts              # Main router
    │   ├── admin.coupons.routes.ts
    │   ├── auth.routes.ts
    │   ├── customer.products.routes.ts
    │   ├── customer.purchase.routes.ts
    │   └── reseller.routes.ts
    │
    ├── services/                 # Business logic layer
    │   ├── adminCoupon.service.ts
    │   ├── auth.service.ts
    │   └── purchase.service.ts
    │
    ├── utils/
    │   ├── jwt.ts                # JWT generation/verification
    │   ├── password.ts           # bcrypt password hashing
    │   └── pricing.ts            # minimumSellPrice calculation
    │
    └── validators/               # Zod validation schemas
        ├── adminCoupon.validator.ts
        ├── auth.validator.ts
        ├── http.validator.ts
        └── purchase.validator.ts
```

## File Count Summary

- **Root files**: 6 (Dockerfile, package.json, tsconfig.json, etc.)
- **Prisma files**: 2 (schema.prisma, seed.ts)
- **Source files**: 35+ TypeScript files
- **Total**: ~43 files (excluding node_modules)

## Directory Structure

- **config/**: Configuration and setup files
- **controllers/**: HTTP request handlers (thin layer)
- **dto/**: Data Transfer Objects for API boundaries
- **errors/**: Custom error classes and mapping
- **lib/**: Type definitions and augmentations
- **middleware/**: Express middleware functions
- **repositories/**: Database access layer
- **routes/**: Route definitions
- **services/**: Business logic layer
- **utils/**: Utility functions
- **validators/**: Zod validation schemas
