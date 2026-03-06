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

export const productIdParamSchema = z.object({
  productId: z.string().uuid(),
});

// Aliases for backward compatibility
export const createAdminCouponSchema = createCouponProductSchema;
export const updateAdminCouponSchema = updateCouponProductSchema;
