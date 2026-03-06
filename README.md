# Nexus Coupon Marketplace

A production-ready full-stack digital coupon marketplace with strict pricing rules, secure reseller API, admin CRUD operations, and transaction-safe purchase flows. Built with modern TypeScript, Express, React, and PostgreSQL.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Pricing Rules](#pricing-rules)
- [Concurrency Strategy](#concurrency-strategy)
- [Setup Instructions](#setup-instructions)
- [Docker Deployment](#docker-deployment)
- [Seeded Credentials](#seeded-credentials)
- [Future Improvements](#future-improvements)

## 🎯 Project Overview

Nexus Coupon Marketplace is a digital marketplace platform that enables:

- **Admin users** to manage coupon products (CRUD operations) with server-side pricing calculations
- **Direct customers** to purchase coupons at minimum sell price
- **Resellers** to purchase coupons at custom prices (≥ minimum sell price) via Bearer token authentication
- **Transaction-safe** purchase flows that prevent double-selling under concurrent requests

The system enforces strict business rules:
- `minimumSellPrice` is **always calculated server-side** from `costPrice` and `marginPercentage`
- Coupon values are **hidden** in all GET endpoints and **only revealed** after successful purchase
- Atomic transactions with `updateMany` pattern prevent double-selling under concurrent requests
- Each product can only be sold once (single-item inventory model)

## ✨ Features

### Admin Features
- JWT-based authentication
- Full CRUD operations for coupon products
- Purchase statistics (count, revenue) per product
- Server-side pricing calculation (costPrice + marginPercentage → minimumSellPrice)
- Soft/hard delete based on purchase history

### Customer Features
- Browse available products (public API, only unsold products)
- View product details (name, description, image, price)
- Purchase products at minimum sell price (atomic transaction)
- Receive coupon value only after successful purchase

### Reseller Features
- Bearer token authentication (single token via `RESELLER_API_TOKEN`)
- Browse available products (only unsold products)
- View product details (name, description, image, price)
- Purchase at custom prices (must be ≥ minimum sell price)
- Receive coupon value only after successful purchase

### Technical Features
- **Transaction Safety**: Atomic `updateMany` pattern prevents double-selling
- **Centralized Error Handling**: Consistent error responses with `{ error_code, message }` format
- **Request Validation**: Zod schemas for all inputs (body, params, query)
- **Type Safety**: Full TypeScript coverage with strict mode
- **DTO Mappers**: Clean separation between database models and API responses
- **Health Checks**: Built-in health endpoints (`/health`, `/api/version`)
- **Docker Support**: Production-ready containerization with multi-stage builds

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 20
- **Language**: TypeScript 5.3
- **Framework**: Express 4.18
- **ORM**: Prisma 5.7
- **Database**: PostgreSQL 16
- **Authentication**: JWT (jsonwebtoken), bcryptjs
- **Validation**: Zod 3.22
- **API Docs**: Swagger UI Express, @asteasolutions/zod-to-openapi
- **Security**: Helmet, CORS

### Frontend
- **Framework**: React 18.2
- **Language**: TypeScript 5.3
- **Build Tool**: Vite 5.0
- **Routing**: React Router 6.21
- **HTTP Client**: Axios 1.6
- **Web Server**: Nginx (production)

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Database**: PostgreSQL 16 Alpine

## 🏗 Architecture

### Project Structure

```
nexus-coupon-marketplace/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration (env, prisma, openapi)
│   │   ├── constants/       # Application constants
│   │   ├── controllers/      # HTTP request handlers (thin layer)
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── errors/           # Custom error classes & mappers
│   │   ├── lib/              # Type augmentations
│   │   ├── middleware/       # Express middleware (auth, validation, error handling)
│   │   ├── repositories/     # Database access layer
│   │   ├── routes/           # Route definitions
│   │   ├── services/         # Business logic layer
│   │   ├── utils/            # Utility functions (pricing, password, JWT)
│   │   ├── validators/       # Zod validation schemas
│   │   ├── app.ts            # Express app setup
│   │   └── server.ts         # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Seed script
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/              # API client configuration
│   │   ├── components/      # Reusable React components
│   │   ├── pages/            # Page components (admin, customer)
│   │   ├── types/            # TypeScript type definitions
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Entry point
│   ├── public/               # Static assets
│   ├── nginx.conf            # Nginx configuration
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

### Layered Architecture

The backend follows a **layered architecture** pattern:

1. **Controllers** (Thin): Handle HTTP requests/responses, delegate to services
2. **Services**: Contain business logic, orchestrate repository calls
3. **Repositories**: Abstract database access, use Prisma directly
4. **DTOs**: Define data transfer objects for API boundaries
5. **Validators**: Zod schemas for request validation
6. **Middleware**: Authentication, validation, error handling

### Design Patterns

- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic encapsulation
- **DTO Pattern**: Type-safe API boundaries with mapper functions
- **Middleware Chain**: Request processing pipeline (auth, validation, error handling)
- **Transaction Pattern**: Atomic operations with Prisma transactions

## 🗄 Database Schema

### Core Models

#### `Product` (Base Entity)
The main product table. Currently supports only `COUPON` type.

```prisma
model Product {
  id          String      @id @default(uuid())
  name        String
  description String
  type        ProductType  // Currently only COUPON
  imageUrl    String      @map("image_url")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  coupon      Coupon?     // 1:1 relation for COUPON type
  purchase    Purchase?   // 1:1 relation (each product can only be sold once)
}
```

#### `Coupon` (Subtype)
1:1 relation with `Product` when `type === COUPON`. Contains pricing and coupon details.

```prisma
model Coupon {
  productId         String          @id @map("product_id")
  costPrice         Decimal         @db.Decimal(10, 2) @map("cost_price")
  marginPercentage  Decimal         @db.Decimal(10, 2) @map("margin_percentage")
  minimumSellPrice  Decimal         @db.Decimal(10, 2) @map("minimum_sell_price")
  isSold            Boolean         @default(false) @map("is_sold")
  soldAt            DateTime?       @map("sold_at")
  valueType         CouponValueType @map("value_type")  // STRING or IMAGE
  value             String          // Coupon value (hidden until purchase)

  product           Product         @relation(fields: [productId], references: [id], onDelete: Cascade)
}
```

**Key Fields:**
- `costPrice` & `marginPercentage`: Admin-only, used to calculate `minimumSellPrice`
- `minimumSellPrice`: Calculated server-side, visible to customers/resellers as `price`
- `isSold`: Prevents double-selling (atomic updates)
- `value`: Hidden in listings, revealed only after purchase

#### `Purchase`
Records all purchases. Each product can only have one purchase (1:1 relation).

```prisma
model Purchase {
  id           String          @id @default(uuid())
  productId    String          @unique @map("product_id")
  channel      PurchaseChannel  // DIRECT_CUSTOMER or RESELLER
  finalPrice   Decimal         @db.Decimal(10, 2) @map("final_price")
  resellerName String?         @map("reseller_name")
  purchasedAt  DateTime        @default(now()) @map("purchased_at")
  createdAt    DateTime        @default(now()) @map("created_at")

  product      Product         @relation(fields: [productId], references: [id], onDelete: Cascade)
}
```

**Key Fields:**
- `channel`: Distinguishes between direct customer and reseller purchases
- `finalPrice`: Actual price paid (minimum for customers, custom for resellers)
- `productId`: Unique constraint ensures one purchase per product

#### `User`
Admin authentication only.

```prisma
model User {
  id           String    @id @default(uuid())
  username     String    @unique
  passwordHash String    @map("password_hash")
  role         UserRole  // Currently only ADMIN
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
}
```

### Schema Design Decisions

1. **Simplified Schema**: Single product type (COUPON) with dedicated `Coupon` table
2. **Single-Item Products**: Each product can only be sold once (`isSold` flag, unique `Purchase.productId`)
3. **Decimal Types**: All money fields use `Decimal` for precision
4. **Pricing in Coupon**: `costPrice`, `marginPercentage`, and `minimumSellPrice` stored in `Coupon` table
5. **Atomic Updates**: `isSold` flag with `updateMany` pattern prevents race conditions
6. **Cascade Deletes**: Deleting a product automatically deletes its coupon and purchase

## 📡 API Documentation

### Base URL
- **Local**: `http://localhost:3000`
- **API Base**: `http://localhost:3000/api`
- **Health Check**: `http://localhost:3000/health`

### API Routes

#### System
- `GET /health` - Health check
- `GET /api/version` - Service version

#### Authentication
- `POST /api/admin/auth/login` - Admin login (returns JWT)
- `GET /api/admin/auth/me` - Get current admin user (JWT required)

#### Admin (JWT Required)
- `GET /api/admin/coupons` - List all coupon products
- `POST /api/admin/coupons` - Create coupon product
- `GET /api/admin/coupons/:id` - Get coupon by ID
- `PUT /api/admin/coupons/:id` - Update coupon product
- `DELETE /api/admin/coupons/:id` - Delete coupon
- `GET /api/admin/coupons/:id/stats` - Get purchase statistics
- `GET /api/admin/purchases` - List all purchases

#### Customer (Public)
- `GET /api/customer/products` - List available products (not sold)
- `GET /api/customer/products/:productId` - Get product by ID
- `POST /api/customer/products/:productId/purchase` - Purchase product (at minimum price)

#### Reseller (Bearer Token Required)
- `GET /api/v1/products` - List available products (not sold)
- `GET /api/v1/products/:productId` - Get product by ID
- `POST /api/v1/products/:productId/purchase` - Purchase product (custom price ≥ minimum)

### Response Format

**Success Response (Admin endpoints):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Success Response (Admin Login):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Success Response (Public/Reseller GET endpoints):**
```json
[
  { "id": "...", "name": "...", "description": "...", "image_url": "...", "price": 100.00 }
]
```

**Success Response (Purchase endpoints):**
```json
{
  "product_id": "uuid",
  "final_price": 100.00,
  "value_type": "STRING",
  "value": "ABCD-1234"
}
```

**Error Response:**
```json
{
  "error_code": "ERROR_CODE",
  "message": "Human readable error message"
}
```

**Common Error Codes:**
- `PRODUCT_NOT_FOUND` (404) - Product does not exist
- `PRODUCT_ALREADY_SOLD` (409) - Product has already been purchased
- `RESELLER_PRICE_TOO_LOW` (400) - Reseller price is below minimum sell price
- `UNAUTHORIZED` (401) - Missing or invalid authentication token
- `VALIDATION_ERROR` (400) - Request validation failed

## 🔐 Authentication

### Admin Authentication (JWT)

1. **Login**: `POST /api/admin/auth/login`
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
   Returns JWT token:
   ```json
   {
     "success": true,
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     }
   }
   ```

2. **Usage**: Include in `Authorization` header:
   ```
   Authorization: Bearer <jwt-token>
   ```

3. **Token Expiry**: Configurable via `JWT_EXPIRES_IN` (default: 1d)

### Reseller Authentication (Bearer Token)

1. **Configuration**: Set `RESELLER_API_TOKEN` environment variable:
   ```env
   RESELLER_API_TOKEN=nexus-reseller-token
   ```

2. **Usage**: Include in `Authorization` header:
   ```
   Authorization: Bearer <reseller-token>
   ```

3. **All reseller endpoints** (`/api/v1/products/*`) require this token

## 💰 Pricing Rules

### Server-Side Calculation

**Critical Rule**: `minimumSellPrice` is **never accepted from client input**. It is always calculated server-side.

**Formula:**
```
minimumSellPrice = costPrice × (1 + marginPercentage / 100)
```

**Implementation**: See `backend/src/utils/pricing.ts`

### Pricing Fields

- **`costPrice`**: Internal cost basis (admin-only, visible in admin API)
- **`marginPercentage`**: Markup percentage (0-100, admin-only)
- **`minimumSellPrice`**: Calculated server-side, visible to customers/resellers
- **`couponValue`**: Coupon redemption value (hidden until purchase)

### Purchase Rules

1. **Customer Purchase** (`POST /api/customer/products/:productId/purchase`):
   - No request body required
   - Automatically purchases at `minimumSellPrice`
   - Returns coupon value only after successful purchase
   - Atomic transaction prevents double-selling

2. **Reseller Purchase** (`POST /api/v1/products/:productId/purchase`):
   - Request body: `{ "reseller_price": 120.00 }`
   - Must provide `reseller_price` ≥ `minimumSellPrice`
   - Returns coupon value only after successful purchase
   - Atomic transaction prevents double-selling

3. **Coupon Value**:
   - **Never** exposed in GET endpoints (listings or product details)
   - **Only** returned in purchase response after successful transaction
   - Response format: `{ "product_id": "...", "final_price": 100.00, "value_type": "STRING", "value": "ABCD-1234" }`

## 🔄 Concurrency Strategy

### Problem
Prevent double-selling when multiple requests try to purchase the same product simultaneously.

### Solution: Atomic Transactions with updateMany Pattern

**Implementation**: `backend/src/services/purchases/purchase.service.ts`

```typescript
prisma.$transaction(async (tx) => {
  // 1. Fetch product with coupon
  const productWithCoupon = await tx.product.findUnique({
    where: { id: productId },
    include: { coupon: true },
  });

  // 2. Check if already sold
  if (productWithCoupon.coupon.isSold) {
    throw new ConflictError('Product already sold', 'PRODUCT_ALREADY_SOLD');
  }

  // 3. Atomic update: only update if isSold is still false
  const updateResult = await tx.coupon.updateMany({
    where: {
      productId: productId,
      isSold: false,  // ← Critical condition
    },
    data: {
      isSold: true,
      soldAt: new Date(),
    },
  });

  // 4. Check if update succeeded (race condition detection)
  if (updateResult.count === 0) {
    throw new ConflictError('Product already sold', 'PRODUCT_ALREADY_SOLD');
  }

  // 5. Create purchase record
  await tx.purchase.create({ ... });

  // 6. Return coupon value
  return { product_id, final_price, value_type, value };
});
```

### How It Works

1. **Prisma Transaction**: All operations wrapped in `prisma.$transaction()` for atomicity
2. **Double-Check Pattern**: 
   - First check: Read `isSold` flag
   - Atomic update: `updateMany` with condition `isSold: false`
   - Second check: Verify `updateResult.count > 0`
3. **Race Condition Protection**: If two requests arrive simultaneously:
   - First request: `updateMany` succeeds, `count = 1` → purchase succeeds
   - Second request: `updateMany` fails, `count = 0` → throws `409 PRODUCT_ALREADY_SOLD`
4. **Error Handling**: Returns `409 Conflict` with `PRODUCT_ALREADY_SOLD` error code

### Trade-offs

- **Pros**: Guarantees no double-selling, simple implementation, works with single-item products
- **Cons**: Uses `updateMany` pattern (sufficient for single-item purchases)
- **Note**: Each product can only be sold once (no stock quantity in current schema)

## 🚀 Setup Instructions

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Docker)
- npm or yarn

### Local Development Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd nexus-coupon-marketplace
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev

# Seed database
npm run prisma:seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:3000`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with VITE_API_BASE_URL=http://localhost:3000

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### Environment Variables

#### Backend (`.env`)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/nexus_coupon_db?schema=public
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
JWT_SECRET=change-me-to-a-long-random-secret-at-least-32-chars
JWT_EXPIRES_IN=1d
RESELLER_API_TOKEN=nexus-reseller-token
```

#### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:3000
```

## 🐳 Docker Deployment

### Quick Start

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env with your values (especially JWT_SECRET!)

# 3. Build and start all services
docker-compose up -d --build

# 4. Run migrations and seed (first time only)
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run prisma:seed

# 5. View logs
docker-compose logs -f

# 6. Access services
# Frontend: http://localhost:8080
# Backend: http://localhost:3000
# Swagger: http://localhost:3000/api/docs
```

### Docker Services

- **postgres**: PostgreSQL 16 Alpine
- **backend**: Node.js 20 Alpine (multi-stage build)
- **frontend**: Nginx Alpine (serves built React app)

### Docker Compose Environment Variables

Edit `.env` in project root:

```env
# PostgreSQL
POSTGRES_USER=nexus_user
POSTGRES_PASSWORD=nexus_password
POSTGRES_DB=nexus_coupon_db
POSTGRES_PORT=5432

# Backend
NODE_ENV=production
BACKEND_PORT=3000
CORS_ORIGIN=*
JWT_SECRET=your-secure-jwt-secret-min-32-chars
JWT_EXPIRES_IN=1d
RESELLER_API_TOKEN=nexus-reseller-token

# Frontend
FRONTEND_PORT=8080
VITE_API_BASE_URL=http://localhost:3000
```

### Production Considerations

1. **Security**:
   - Change default passwords
   - Use strong `JWT_SECRET` (32+ characters, random)
   - Set `CORS_ORIGIN` to your frontend domain
   - Use secrets management (Docker secrets, AWS Secrets Manager, etc.)

2. **Performance**:
   - Enable PostgreSQL connection pooling
   - Use reverse proxy (nginx/traefik) for SSL termination
   - Configure proper resource limits in docker-compose

3. **Monitoring**:
   - Health checks are built-in (`/health` endpoints)
   - Add logging aggregation (ELK, Loki, etc.)
   - Set up database backups

## 🔑 Seeded Credentials

After running `npm run prisma:seed`, the following credentials are available:

### Admin User
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `ADMIN`

**⚠️ Important**: Change these credentials in production!

### Sample Products

The seed script creates 4 sample coupon products:

1. Amazon $100 Coupon - Cost: $80, Margin: 25%, Price: $100.00
2. Spotify Premium Coupon - Cost: $30, Margin: 20%, Price: $36.00
3. Steam Wallet $50 - Cost: $38, Margin: 25%, Price: $47.50
4. Cinema QR Pass - Cost: $40, Margin: 15%, Price: $46.00

All products start with `isSold: false` and can be purchased once.

## 🔮 Future Improvements

### Short-term
- [ ] Rate limiting for API endpoints
- [ ] Request logging and monitoring
- [ ] Unit and integration tests
- [ ] CI/CD pipeline
- [ ] Support for multiple purchases per product (stock quantity)

### Medium-term
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notifications for purchases
- [ ] Admin dashboard analytics
- [ ] Product image uploads
- [ ] Search and filtering enhancements

### Long-term
- [ ] Multi-currency support
- [ ] Subscription products
- [ ] Reseller commission tracking
- [ ] Inventory management (low stock alerts)
- [ ] GraphQL API option
- [ ] Microservices architecture (if scale requires)

## 📝 License

This project is a demonstration/portfolio project. Use as reference or starting point.

## 👤 Author

Built as a production-quality full-stack exercise project.

---

**Note**: This is an interview-ready implementation showcasing:
- Clean architecture and separation of concerns
- Production-ready error handling and validation
- Transaction-safe concurrent operations
- Comprehensive API documentation
- Docker containerization
- Type-safe TypeScript throughout