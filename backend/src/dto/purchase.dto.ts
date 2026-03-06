/**
 * Purchase DTOs
 */

export type CouponValueType = 'STRING' | 'IMAGE';
export type PurchaseChannel = 'DIRECT_CUSTOMER' | 'RESELLER';

export interface ResellerPurchaseRequestDto {
  reseller_price: number;
  reseller_name?: string;
}

export type DirectCustomerPurchaseRequestDto = Record<string, never>;

export interface PurchaseSuccessResponseDto {
  product_id: string;
  final_price: number;
  value_type: CouponValueType;
  value: string;
}

export interface PurchaseRecordResponseDto {
  id: string;
  product_id: string;
  product_name: string;
  channel: PurchaseChannel;
  final_price: number;
  reseller_name: string | null;
  purchased_at: string;
}
