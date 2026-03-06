/**
 * Product DTOs
 */

export type CouponValueType = 'STRING' | 'IMAGE';

// Admin DTOs
export interface CreateCouponProductRequestDto {
  name: string;
  description: string;
  image_url: string;
  cost_price: number;
  margin_percentage: number;
  value_type: CouponValueType;
  value: string;
}

export interface UpdateCouponProductRequestDto {
  name?: string;
  description?: string;
  image_url?: string;
  cost_price?: number;
  margin_percentage?: number;
  value_type?: CouponValueType;
  value?: string;
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
  value_type: CouponValueType;
  value: string;
  created_at: string;
  updated_at: string;
}

// Public DTOs (for Customer and Reseller)
// NOTE: PublicProductResponseDto is defined in publicProduct.dto.ts
// This export is kept for backward compatibility but should use publicProduct.dto.ts
export type { PublicProductResponseDto } from './publicProduct.dto';
