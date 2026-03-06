import { z } from 'zod';

// Customer purchase - no body needed, productId from URL
export const customerPurchaseSchema = z.object({}).strict();

// Reseller purchase request body - only reseller_price is required
export const resellerPurchaseSchema = z.object({
  reseller_price: z.number().min(0, 'reseller_price must be >= 0'),
});

export type CustomerPurchaseBody = z.infer<typeof customerPurchaseSchema>;
export type ResellerPurchaseBody = z.infer<typeof resellerPurchaseSchema>;
