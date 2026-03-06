# Nexus Coupon Marketplace - Implementation Plan

## 📁 Final Folder Structure

```
nexus-coupon-marketplace/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts              # Environment variable validation
│   │   │   ├── prisma.ts           # Prisma client singleton
│   │   │   └── openapi.ts          # Swagger/OpenAPI configuration
│   │   ├── constants/
│   │   │   └── index.ts            # Application constants
│   │   ├── controllers/           # Thin HTTP request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── adminCoupon.controller.ts
│   │   │   └── purchase.controller.ts
│   │   ├── dto/                    # Data Transfer Objects
│   │   │   └── adminCoupon.dto.ts
│   │   ├── errors/                 # Custom error classes
│   │   │   ├── appError.ts         # Base error classes
│   │   │   └── errorMapper.ts     # Error mapping logic
│   │   ├── lib/
│   │   │   └── express.d.ts        # Express type augmentations
│   │   ├── middleware/
│   │   │   ├── authenticateAdmin.ts
│   │   │   ├── authenticateReseller.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── notFound.ts
│   │   │   ├── requestId.ts
│   │   │   ├── requestLogger.ts
│   │   │   ├── swagger.ts
│   │   │   └── validateRequest.ts
│   │   ├── repositories/           # Data access layer
│   │   │   └── adminCoupon.repository.ts
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── admin.coupons.routes.ts
│   │   │   ├── customer.products.routes.ts
│   │   │   ├── customer.purchase.routes.ts
│   │   │   └── reseller.routes.ts
│   │   ├── services/                # Business logic layer
│   │   │   ├── auth.service.ts
│   │   │   ├── adminCoupon.service.ts
│   │   │   └── purchase.service.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts              # JWT generation/verification
│   │   │   ├── password.ts         # bcrypt password hashing
│   │   │   └── pricing.ts          # minimumSellPrice calculation
│   │   ├── validators/             # Zod validation schemas
│   │   │   ├── auth.validator.ts
│   │   │   ├── adminCoupon.validator.ts
│   │   │   ├── purchase.validator.ts
│   │   │   └── http.validator.ts
│   │   ├── app.ts                  # Express app setup
│   │   └── server.ts               # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   └── seed.ts                 # Seed script
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── nodemon.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts           # Axios client configuration
│   │   ├── components/             # Reusable React components
│   │   │   ├── Button.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   └── Loading.tsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── CouponList.tsx
│   │   │   │   ├── CouponForm.tsx
│   │   │   │   └── CouponDetail.tsx
│   │   │   ├── customer/
│   │   │   │   ├── ProductList.tsx
│   │   │   │   └── ProductDetail.tsx
│   │   │   └── Login.tsx
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript type definitions
│   │   ├── App.tsx                 # Root component with routing
│   │   ├── main.tsx                # Entry point
│   │   └── index.css
│   ├── public/
│   │   └── favicon.svg
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   ├── index.html
│   ├── nginx.conf                  # Nginx config for production
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── .env.example
├── .dockerignore
└── README.md
```

## 🛣 Route Design

### Base URL Structure
- **Base**: `/api`
- **Swagger Docs**: `/api/docs`
- **OpenAPI JSON**: `/api/openapi.json`
- **Health Check**: `/health` (outside `/api`)

### Route Organization

#### 1. System Routes (`/api`)
```
GET  /api              # Service info
GET  /api/version      # Version info
```

#### 2. Authentication Routes (`/api/auth`)
```
POST /api/auth/login   # Admin login (returns JWT)
GET  /api/auth/me      # Get current admin user (JWT required)
```

#### 3. Admin Routes (`/api/admin/coupons`)
**Authentication**: JWT Bearer token (Admin role required)

```
GET    /api/admin/coupons           # List all coupon products
POST   /api/admin/coupons           # Create new coupon product
GET    /api/admin/coupons/:id       # Get coupon by ID
PUT    /api/admin/coupons/:id       # Update coupon product
DELETE /api/admin/coupons/:id       # Delete/deactivate coupon
GET    /api/admin/coupons/:id/stats # Get purchase statistics
```

**Response Fields (Admin View)**:
- All pricing fields: `costPrice`, `marginPercentage`, `minimumSellPrice`
- Coupon details: `coupon.value`, `coupon.code`
- Inventory: `stock`, `reservedStock`
- Full product metadata

#### 4. Customer Routes (Public)

**Browse Products** (`/api/customer/products`):
```
GET /api/customer/products      # List active products
GET /api/customer/products/:id  # Get product by ID
```

**Response Fields (Customer View)**:
- Public fields: `id`, `name`, `description`, `minimumSellPrice`, `currency`, `stock`
- **Hidden**: `costPrice`, `marginPercentage`, `coupon.value`, `coupon.code`

**Purchase** (`/api/customer/purchase`):
```
POST /api/customer/purchase     # Purchase product at minimum price
```

**Request Body**:
```json
{
  "productId": "uuid"
}
```

**Response**: Purchase result with `couponValue` revealed

#### 5. Reseller Routes (`/api/reseller`)
**Authentication**: Bearer token (from `RESELLER_TOKENS` env var)

**Browse Products** (`/api/reseller/products`):
```
GET /api/reseller/products      # List active products
GET /api/reseller/products/:id  # Get product by ID
```

**Response Fields (Reseller View)**:
- Same as customer, but can see `minimumSellPrice`
- **Hidden**: `costPrice`, `marginPercentage`, `coupon.value`, `coupon.code`

**Purchase** (`/api/reseller/purchase`):
```
POST /api/reseller/purchase     # Purchase with custom price
```

**Request Body**:
```json
{
  "productId": "uuid",
  "resellerPrice": 50.00  // Must be >= minimumSellPrice
}
```

**Response**: Purchase result with `couponValue` revealed

## 🗄 Prisma Schema Design

### Design Principles
1. **Single Table Inheritance (STI)**: `Product` base entity with subtype relations
2. **Server-Side Pricing**: `minimumSellPrice` calculated from `costPrice` + `marginPercentage`
3. **Scalability**: Support future product types without schema changes
4. **Data Integrity**: Foreign keys, constraints, indexes
5. **Audit Trail**: Timestamps on all models

### Schema Structure

#### Enums
```prisma
enum ProductType {
  COUPON
  DIGITAL
  PHYSICAL
  // Future: SERVICE, SUBSCRIPTION
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
```

#### Models

**1. Product (Base Entity)**
```prisma
model Product {
  id          String      @id @default(uuid())
  productType ProductType
  
  // Basic Info
  name        String
  description String?     @db.Text
  
  // Pricing (Decimal for precision)
  costPrice        Decimal @db.Decimal(10, 2)  // Admin only
  marginPercentage Decimal @db.Decimal(5, 2)   // Admin only
  minimumSellPrice Decimal @db.Decimal(10, 2)   // Calculated server-side
  currency         String  @default("USD") @db.VarChar(3)
  
  // Inventory
  stock         Int     @default(0)
  reservedStock Int     @default(0)  // For pending purchases
  isActive      Boolean @default(true)
  
  // Catalog
  sku      String?  @unique @db.VarChar(100)
  category String?  @db.VarChar(100)
  tags     String[] @default([])
  
  // Relations
  coupon    Coupon?      // 1:1 for COUPON type
  purchases Purchase[]
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Indexes
  @@index([productType])
  @@index([isActive])
  @@index([isActive, stock])
  @@index([createdAt])
  @@map("products")
}
```

**2. Coupon (Subtype)**
```prisma
model Coupon {
  id        String  @id @default(uuid())
  productId String  @unique
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  value     Decimal @db.Decimal(10, 2)  // Hidden until purchase
  code      String? @db.VarChar(255)    // Optional voucher code
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([productId])
  @@map("coupons")
}
```

**3. User**
```prisma
model User {
  id       String   @id @default(uuid())
  email    String   @unique
  password String   // bcrypt hashed
  role     UserRole @default(CUSTOMER)
  
  purchases Purchase[] @relation("UserPurchases")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([role])
  @@map("users")
}
```

**4. Purchase**
```prisma
model Purchase {
  id        String  @id @default(uuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Restrict)
  
  buyerType BuyerType
  
  // Optional customer link (anonymous purchases allowed)
  customerUserId String?
  customerUser   User?   @relation("UserPurchases", fields: [customerUserId], references: [id], onDelete: SetNull)
  
  // Reseller token identifier (not FK - tokens in env)
  resellerTokenId String? @db.VarChar(64)
  
  purchasePrice Decimal @db.Decimal(10, 2)
  couponValue   Decimal? @db.Decimal(10, 2)  // Snapshot at purchase time
  
  status        PurchaseStatus @default(COMPLETED)
  transactionId String?        @unique
  notes         String?        @db.Text
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([productId])
  @@index([buyerType])
  @@index([customerUserId])
  @@index([resellerTokenId])
  @@index([status])
  @@index([createdAt])
  @@index([productId, createdAt])
  @@map("purchases")
}
```

### Key Design Decisions

1. **STI Pattern**: `Product` + `Coupon` allows adding `DigitalProduct`, `PhysicalProduct` without changing core schema
2. **Decimal Types**: All money fields use `Decimal` for precision (no floating-point errors)
3. **Server-Side Calculation**: `minimumSellPrice` stored but never accepted from client
4. **Optional Relations**: `customerUserId` nullable for anonymous purchases
5. **Reseller Tokens**: Stored as string identifier, not FK (tokens configured in env)
6. **Cascade Deletes**: `Coupon` deleted when `Product` deleted
7. **Restrict Deletes**: `Purchase` prevents `Product` deletion (preserve history)

## 📋 Implementation Plan

### Phase 1: Project Scaffolding
1. ✅ Create monorepo structure
2. ✅ Initialize backend (Express + TypeScript)
3. ✅ Initialize frontend (React + Vite + TypeScript)
4. ✅ Set up Docker and Docker Compose
5. ✅ Configure environment variables

### Phase 2: Database Layer
1. ✅ Design Prisma schema
2. ✅ Create migrations
3. ✅ Generate Prisma Client
4. ✅ Implement seed script with sample data
5. ✅ Set up database connection

### Phase 3: Backend Core
1. ✅ Express app setup (middleware, CORS, helmet)
2. ✅ Environment configuration
3. ✅ Error handling architecture
4. ✅ Request validation (Zod)
5. ✅ Request ID and logging middleware

### Phase 4: Authentication
1. ✅ Password hashing utilities (bcrypt)
2. ✅ JWT utilities (sign, verify)
3. ✅ Admin login endpoint
4. ✅ Admin JWT middleware
5. ✅ Reseller Bearer token middleware

### Phase 5: Admin CRUD API
1. ✅ Admin coupon DTOs
2. ✅ Admin coupon validators (Zod)
3. ✅ Pricing calculation utility
4. ✅ Admin coupon repository
5. ✅ Admin coupon service
6. ✅ Admin coupon controller
7. ✅ Admin coupon routes
8. ✅ Purchase statistics endpoint

### Phase 6: Customer API
1. ✅ Public product listing (hide sensitive fields)
2. ✅ Public product detail (hide coupon value)
3. ✅ Customer purchase endpoint
4. ✅ Purchase service with transaction safety

### Phase 7: Reseller API
1. ✅ Reseller product listing
2. ✅ Reseller product detail
3. ✅ Reseller purchase endpoint (custom price validation)

### Phase 8: Purchase Flow (Critical)
1. ✅ Atomic transaction implementation
2. ✅ Serializable isolation level
3. ✅ Stock validation and decrement
4. ✅ Coupon value revelation after purchase
5. ✅ Error handling for concurrent purchases

### Phase 9: API Documentation
1. ✅ Swagger/OpenAPI setup
2. ✅ Document all endpoints
3. ✅ Request/response schemas
4. ✅ Authentication examples
5. ✅ Error response examples

### Phase 10: Frontend
1. ✅ API client setup (Axios)
2. ✅ Type definitions
3. ✅ Reusable components (Button, Loading, ErrorMessage)
4. ✅ Admin login page
5. ✅ Admin dashboard
6. ✅ Admin coupon CRUD pages
7. ✅ Customer product list
8. ✅ Customer product detail and purchase flow
9. ✅ Loading, success, and error states

### Phase 11: Docker & Deployment
1. ✅ Backend Dockerfile (multi-stage)
2. ✅ Frontend Dockerfile (multi-stage with nginx)
3. ✅ Docker Compose configuration
4. ✅ Health checks
5. ✅ Environment variable examples
6. ✅ .dockerignore files

### Phase 12: Documentation
1. ✅ Comprehensive README
2. ✅ Setup instructions
3. ✅ API documentation
4. ✅ Architecture explanation
5. ✅ Database schema explanation
6. ✅ Concurrency strategy documentation

## 🔐 Security Considerations

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Security**: Secure secret, expiration, issuer/audience validation
3. **Input Validation**: Zod schemas for all inputs
4. **SQL Injection**: Prisma ORM prevents SQL injection
5. **XSS Protection**: Helmet middleware, React escaping
6. **CORS**: Configurable origin restrictions
7. **Error Messages**: No sensitive data in error responses
8. **Environment Variables**: Secrets not in code

## 🎯 Business Rules Implementation

### Pricing Rules
- ✅ `minimumSellPrice` calculated server-side only
- ✅ Formula: `costPrice × (1 + marginPercentage / 100)`
- ✅ Never accept `minimumSellPrice` from client
- ✅ Validation: `.strict()` in Zod schemas to reject unknown fields

### Purchase Rules
- ✅ Customers: Must pay exact `minimumSellPrice`
- ✅ Resellers: Must pay `≥ minimumSellPrice`
- ✅ Coupon value hidden until successful purchase
- ✅ Atomic transactions prevent double-selling

### Data Visibility Rules
- ✅ Admin: See all fields (costPrice, marginPercentage, coupon.value)
- ✅ Reseller: See minimumSellPrice, but not costPrice or coupon.value
- ✅ Customer: See minimumSellPrice, but not costPrice or coupon.value
- ✅ Coupon value: Only revealed in purchase response

## 🧪 Testing Strategy (Future)

1. **Unit Tests**: Services, utilities, validators
2. **Integration Tests**: API endpoints, database operations
3. **E2E Tests**: Full purchase flows
4. **Concurrency Tests**: Multiple simultaneous purchases
5. **Load Tests**: High traffic scenarios

## 📊 Monitoring & Observability (Future)

1. **Health Checks**: `/health` endpoint
2. **Request Logging**: Morgan middleware
3. **Error Tracking**: Centralized error handler
4. **Metrics**: Request counts, response times
5. **Alerts**: Database connection failures, high error rates

---

**Status**: ✅ All phases completed and implemented

This plan serves as the architectural blueprint for the Nexus Coupon Marketplace project.
