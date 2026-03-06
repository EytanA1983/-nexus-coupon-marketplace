/**
 * Public Product DTOs (for Customer and Reseller)
 * 
 * Must return ONLY:
 * - id
 * - name
 * - description
 * - image_url
 * - price
 * 
 * Must NOT return:
 * - cost_price
 * - margin_percentage
 * - coupon value
 */
export interface PublicProductResponseDto {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
}
