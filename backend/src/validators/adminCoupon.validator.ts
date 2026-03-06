import { z } from 'zod';

export const createCouponProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  image_url: z.string().url(),
  cost_price: z.number().min(0),
  margin_percentage: z.number().min(0),
  value_type: z.enum(['STRING', 'IMAGE']),
  value: z.string().min(1),
});

export const updateCouponProductSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().min(1).optional(),
    image_url: z.string().url().optional(),
    cost_price: z.number().min(0).optional(),
    margin_percentage: z.number().min(0).optional(),
    value_type: z.enum(['STRING', 'IMAGE']).optional(),
    value: z.string().min(1).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update.' }
  );

// Support both :id and :productId params for backward compatibility
export const idParamSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
}).refine((data) => data.id || data.productId, {
  message: 'Either id or productId must be provided',
});

// Recommended: productId only - exported from product.validator for consistency
export { productIdParamSchema } from './product.validator';

// Aliases for backward compatibility
export const createAdminCouponSchema = createCouponProductSchema;
export const updateAdminCouponSchema = updateCouponProductSchema;
