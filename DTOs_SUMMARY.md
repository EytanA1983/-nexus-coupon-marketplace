# DTOs Summary - All Central DTOs Defined

## ✅ Created DTO Files

### 1. `src/dto/auth.dto.ts`
- `AdminLoginRequestDto` - username, password
- `AdminLoginResponseDto` - token only

### 2. `src/dto/adminCoupon.dto.ts`
- `CreateCouponProductRequestDto` - name, description, image_url, cost_price, margin_percentage, value_type, value
- `UpdateCouponProductRequestDto` - all fields optional
- `AdminProductResponseDto` - full admin view with all fields including is_sold, sold_at

### 3. `src/dto/publicProduct.dto.ts`
- `PublicProductResponseDto` - id, name, description, image_url, price (only public fields)

### 4. `src/dto/purchase.dto.ts`
- `ResellerPurchaseRequestDto` - reseller_price, reseller_name (optional)
- `DirectCustomerPurchaseRequestDto` - empty record (no body)
- `PurchaseSuccessResponseDto` - product_id, final_price, value_type, value
- `PurchaseRecordResponseDto` - for admin purchases endpoint

### 5. `src/dto/error.dto.ts`
- `ErrorResponseDto` - error_code, message

## Schema Updates Needed

The Prisma schema needs to be updated to support:
1. `imageUrl` field in Product model ✅ (added)
2. `valueType` enum and field in Coupon model ✅ (added)
3. `value` as String (not Decimal) in Coupon model ✅ (added)

## Next Steps

1. Update all services to map to new DTOs
2. Update all controllers to return new DTOs
3. Update repositories to handle new fields
4. Update purchase service to return PurchaseSuccessResponseDto
5. Update public product endpoints to return PublicProductResponseDto
6. Update admin endpoints to return AdminProductResponseDto with is_sold, sold_at

## Field Mapping

### Request → Database
- `image_url` → `imageUrl` (Product)
- `cost_price` → `costPrice` (Product)
- `margin_percentage` → `marginPercentage` (Product)
- `value_type` → `valueType` (Coupon enum)
- `value` → `value` (Coupon, String)

### Database → Response
- `minimumSellPrice` → `minimum_sell_price` (Admin) or `price` (Public)
- `isActive && stock > 0` → `is_sold: false`
- `purchases.length > 0` → `is_sold: true`, `sold_at: latest purchase date`
- `buyerType` → `channel` (DIRECT_CUSTOMER/RESELLER)
- `purchasePrice` → `final_price`
- `coupon.value` → `value` (revealed after purchase)
