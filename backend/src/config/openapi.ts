import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { env } from './env';
import { adminLoginSchema } from '../validators/auth.validator';
import { createAdminCouponSchema, idParamSchema, updateAdminCouponSchema } from '../validators/adminCoupon.validator';
import { customerPurchaseSchema, resellerPurchaseSchema } from '../validators/purchase.validator';

extendZodWithOpenApi(z);

// ---- Shared response envelope ----
const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
    error_code: z.string(),
    code: z.string(),
    requestId: z.string().optional(),
    details: z.any().optional(),
  }),
});

function successResponse<T extends z.ZodTypeAny>(data: T) {
  return z.object({
    success: z.literal(true),
    data,
  });
}

// ---- Shared domain schemas (response shapes) ----
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'RESELLER', 'CUSTOMER']),
});

const adminLoginResponseSchema = successResponse(
  z.object({
    token: z.string().min(1),
    user: userSchema,
  })
);

const adminMeResponseSchema = successResponse(userSchema);

const publicProductSchema = z.object({
  id: z.string().uuid(),
  productType: z.enum(['COUPON', 'DIGITAL', 'PHYSICAL']),
  name: z.string(),
  description: z.string().nullable(),
  minimumSellPrice: z.string(), // Prisma Decimal serializes to string in JSON
  currency: z.string().length(3),
  stock: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const adminCouponSchema = z.object({
  id: z.string().uuid(),
  sku: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  currency: z.string().length(3),
  costPrice: z.string(),
  marginPercentage: z.string(),
  minimumSellPrice: z.string(),
  stock: z.number().int().nonnegative(),
  reservedStock: z.number().int().nonnegative(),
  isActive: z.boolean(),
  category: z.string().nullable(),
  tags: z.array(z.string()),
  coupon: z
    .object({
      id: z.string().uuid(),
      value: z.string(),
      code: z.string().nullable(),
    })
    .nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const purchaseResultSchema = z.object({
  purchaseId: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string(),
  buyerType: z.enum(['CUSTOMER', 'RESELLER']),
  purchasePrice: z.number(),
  couponValue: z.number().nullable(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']),
  purchasedAt: z.string().datetime(),
});

const couponStatsSchema = successResponse(
  z.object({
    purchaseCount: z.number().int().nonnegative(),
    totalRevenue: z.string(),
  })
);

// ---- OpenAPI registry ----
const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'AdminBearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

registry.registerComponent('securitySchemes', 'ResellerBearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'TOKEN',
});

registry.register('ErrorResponse', errorResponseSchema);
registry.register('AdminLoginResponse', adminLoginResponseSchema);
registry.register('AdminMeResponse', adminMeResponseSchema);
registry.register('PublicProduct', publicProductSchema);
registry.register('AdminCoupon', adminCouponSchema);
registry.register('PurchaseResult', purchaseResultSchema);

// ---- System ----
registry.registerPath({
  method: 'get',
  path: '/health',
  tags: ['System'],
  responses: {
    200: {
      description: 'Health check',
      content: {
        'application/json': {
          schema: z.object({ status: z.literal('ok'), timestamp: z.string().datetime() }),
          example: { status: 'ok', timestamp: new Date().toISOString() },
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/version',
  tags: ['System'],
  responses: {
    200: {
      description: 'Service version',
      content: {
        'application/json': {
          schema: z.object({ name: z.string(), version: z.string() }),
          example: { name: 'nexus-coupon-marketplace-backend', version: '0.1.0' },
        },
      },
    },
  },
});

// ---- Auth ----
registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  tags: ['Auth'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: adminLoginSchema,
          example: { email: 'admin@nexus.com', password: 'admin123' },
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Admin login success',
      content: {
        'application/json': {
          schema: adminLoginResponseSchema,
        },
      },
    },
    400: { description: 'Validation error', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Invalid credentials', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/auth/me',
  tags: ['Auth'],
  security: [{ AdminBearerAuth: [] }],
  responses: {
    200: {
      description: 'Current admin identity',
      content: {
        'application/json': {
          schema: adminMeResponseSchema,
        },
      },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

// ---- Admin coupons ----
registry.registerPath({
  method: 'get',
  path: '/api/admin/coupons',
  tags: ['Admin'],
  security: [{ AdminBearerAuth: [] }],
  responses: {
    200: {
      description: 'List coupon products (admin)',
      content: {
        'application/json': {
          schema: successResponse(z.array(adminCouponSchema)),
        },
      },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/coupons',
  tags: ['Admin'],
  summary: 'Create a new coupon product',
  description:
    'Creates a new coupon product. The server calculates `minimumSellPrice` from `costPrice` and `marginPercentage`. Client must NOT send `minimumSellPrice`.',
  security: [{ AdminBearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: createAdminCouponSchema,
          example: {
            sku: 'AMZ-GC-USD-050',
            name: 'Amazon Gift Card (USD $50)',
            description: 'Instant delivery. Redeemable on Amazon.com (US).',
            currency: 'USD',
            costPrice: 44.0,
            marginPercentage: 9.07,
            couponValue: 50.0,
            stock: 15,
            isActive: true,
            category: 'Gift Cards',
            tags: ['amazon', 'gift-card', 'us', 'instant'],
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Created coupon product',
      content: {
        'application/json': {
          schema: successResponse(adminCouponSchema),
          example: {
            success: true,
            data: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              sku: 'AMZ-GC-USD-050',
              name: 'Amazon Gift Card (USD $50)',
              description: 'Instant delivery. Redeemable on Amazon.com (US).',
              currency: 'USD',
              costPrice: '44.00',
              marginPercentage: '9.07',
              minimumSellPrice: '47.99',
              stock: 15,
              reservedStock: 0,
              isActive: true,
              category: 'Gift Cards',
              tags: ['amazon', 'gift-card', 'us', 'instant'],
              coupon: { id: '660e8400-e29b-41d4-a716-446655440000', value: '50.00', code: null },
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
          },
        },
      },
    },
    400: { description: 'Validation error', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/admin/coupons/{id}',
  tags: ['Admin'],
  security: [{ AdminBearerAuth: [] }],
  request: { params: idParamSchema },
  responses: {
    200: { description: 'Get coupon product', content: { 'application/json': { schema: successResponse(adminCouponSchema) } } },
    400: { description: 'Invalid id', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/admin/coupons/{id}',
  tags: ['Admin'],
  security: [{ AdminBearerAuth: [] }],
  request: {
    params: idParamSchema,
    body: { required: true, content: { 'application/json': { schema: updateAdminCouponSchema } } },
  },
  responses: {
    200: { description: 'Updated coupon product', content: { 'application/json': { schema: successResponse(adminCouponSchema) } } },
    400: { description: 'Validation error', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/admin/coupons/{id}',
  tags: ['Admin'],
  security: [{ AdminBearerAuth: [] }],
  request: { params: idParamSchema },
  responses: {
    200: {
      description: 'Deleted or deactivated coupon product',
      content: {
        'application/json': {
          schema: successResponse(z.object({ message: z.string(), softDeleted: z.boolean() })),
        },
      },
    },
    400: { description: 'Invalid id', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/admin/coupons/{id}/stats',
  tags: ['Admin'],
  summary: 'Get purchase statistics for a coupon product',
  description: 'Returns purchase count and total revenue for completed purchases of a specific coupon product.',
  security: [{ AdminBearerAuth: [] }],
  request: { params: idParamSchema },
  responses: {
    200: {
      description: 'Coupon purchase stats',
      content: {
        'application/json': {
          schema: couponStatsSchema,
          example: {
            success: true,
            data: {
              purchaseCount: 42,
              totalRevenue: '2015.58',
            },
          },
        },
      },
    },
    400: { description: 'Invalid id', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

// ---- Customer (public) ----
registry.registerPath({
  method: 'get',
  path: '/api/customer/products',
  tags: ['Customer'],
  responses: {
    200: { description: 'List active products', content: { 'application/json': { schema: successResponse(z.array(publicProductSchema)) } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/customer/products/{id}',
  tags: ['Customer'],
  request: { params: idParamSchema },
  responses: {
    200: { description: 'Get product', content: { 'application/json': { schema: successResponse(publicProductSchema) } } },
    400: { description: 'Invalid id', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/customer/purchase',
  tags: ['Customer'],
  summary: 'Purchase a product as a customer',
  description:
    'Purchases a product at the minimum sell price. Transaction-safe (Serializable isolation) to prevent double-selling. Coupon value is revealed only after successful purchase.',
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: customerPurchaseSchema,
          example: { productId: '550e8400-e29b-41d4-a716-446655440000' },
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Purchase success',
      content: {
        'application/json': {
          schema: successResponse(purchaseResultSchema),
          example: {
            success: true,
            data: {
              purchaseId: '770e8400-e29b-41d4-a716-446655440000',
              productId: '550e8400-e29b-41d4-a716-446655440000',
              productName: 'Amazon Gift Card (USD $50)',
              buyerType: 'CUSTOMER',
              purchasePrice: 47.99,
              couponValue: 50.0,
              status: 'COMPLETED',
              purchasedAt: '2024-01-01T12:00:00.000Z',
            },
          },
        },
      },
    },
    400: {
      description: 'Validation error or product not available',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    409: {
      description: 'Product already sold (out of stock)',
      content: {
        'application/json': {
          schema: errorResponseSchema,
          example: {
            success: false,
            error: {
              message: 'The product has already been sold.',
              error_code: 'PRODUCT_ALREADY_SOLD',
              code: 'CONFLICT',
            },
          },
        },
      },
    },
  },
});

// ---- Reseller ----
registry.registerPath({
  method: 'get',
  path: '/api/reseller/products',
  tags: ['Reseller'],
  security: [{ ResellerBearerAuth: [] }],
  responses: {
    200: { description: 'List active products (reseller)', content: { 'application/json': { schema: successResponse(z.array(publicProductSchema)) } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/reseller/products/{id}',
  tags: ['Reseller'],
  security: [{ ResellerBearerAuth: [] }],
  request: { params: idParamSchema },
  responses: {
    200: { description: 'Get product (reseller)', content: { 'application/json': { schema: successResponse(publicProductSchema) } } },
    400: { description: 'Invalid id', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/reseller/purchase',
  tags: ['Reseller'],
  summary: 'Purchase a product as a reseller',
  description:
    'Purchases a product with a custom reseller price. The `resellerPrice` must be >= `minimumSellPrice`. Transaction-safe (Serializable isolation) to prevent double-selling. Coupon value is revealed only after successful purchase.',
  security: [{ ResellerBearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: resellerPurchaseSchema,
          example: { productId: '550e8400-e29b-41d4-a716-446655440000', resellerPrice: 49.99 },
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Purchase success (reseller)',
      content: {
        'application/json': {
          schema: successResponse(purchaseResultSchema),
          example: {
            success: true,
            data: {
              purchaseId: '880e8400-e29b-41d4-a716-446655440000',
              productId: '550e8400-e29b-41d4-a716-446655440000',
              productName: 'Amazon Gift Card (USD $50)',
              buyerType: 'RESELLER',
              purchasePrice: 49.99,
              couponValue: 50.0,
              status: 'COMPLETED',
              purchasedAt: '2024-01-01T12:00:00.000Z',
            },
          },
        },
      },
    },
    400: {
      description: 'Validation error, price too low, or product not available',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    401: { description: 'Unauthorized (invalid/missing Bearer token)', content: { 'application/json': { schema: errorResponseSchema } } },
    409: {
      description: 'Product already sold (out of stock)',
      content: {
        'application/json': {
          schema: errorResponseSchema,
          example: {
            success: false,
            error: {
              message: 'The product has already been sold.',
              error_code: 'PRODUCT_ALREADY_SOLD',
              code: 'CONFLICT',
            },
          },
        },
      },
    },
  },
});

export function createOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Nexus Coupon Marketplace API',
      version: process.env.npm_package_version ?? '0.1.0',
      description:
        'Digital coupon marketplace API (admin/reseller/customer) with strict pricing rules and transaction-safe purchase flow.',
    },
    tags: [
      { name: 'System', description: 'System health and version endpoints' },
      { name: 'Auth', description: 'Admin authentication (JWT)' },
      { name: 'Admin', description: 'Admin-only coupon product management (CRUD + stats)' },
      { name: 'Customer', description: 'Public customer endpoints (browse products, purchase at minimum price)' },
      { name: 'Reseller', description: 'Reseller endpoints (Bearer token auth, purchase with custom pricing)' },
    ],
    servers: [
      { url: `http://localhost:${env.PORT}`, description: 'Local' },
    ],
  });
}

