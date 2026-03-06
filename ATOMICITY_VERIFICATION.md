# Atomicity Verification Report

## 🔒 Requirement

**Requirement**: Purchase flow must be atomic. After a successful purchase:
1. First purchase attempt → ✅ Success
2. Second purchase attempt on same product → ❌ 409 PRODUCT_ALREADY_SOLD

---

## 📋 Code Analysis

### Purchase Service Implementation

**File**: `backend/src/services/purchases/purchase.service.ts`

#### Customer Purchase Flow (lines 25-72)

```typescript
async purchaseDirectCustomer(input: DirectPurchaseInput): Promise<PurchaseResult> {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch product with coupon
    const productWithCoupon = await tx.product.findUnique({
      where: { id: input.productId },
      include: { coupon: true },
    });

    // 2. Check if product exists
    if (!productWithCoupon || !productWithCoupon.coupon) {
      throw new NotFoundError('Product not found.', ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    // 3. First check: if already sold → 409
    if (productWithCoupon.coupon.isSold) {
      throw new ConflictError('The product has already been sold.', ERROR_CODES.PRODUCT_ALREADY_SOLD);
    }

    // 4. Atomic update: only update if isSold is still false
    const updateResult = await tx.coupon.updateMany({
      where: {
        productId: input.productId,
        isSold: false,  // ← Critical: condition check
      },
      data: {
        isSold: true,
        soldAt: new Date(),
      },
    });

    // 5. Second check: if updateResult.count === 0, someone else bought it
    if (updateResult.count === 0) {
      throw new ConflictError('The product has already been sold.', ERROR_CODES.PRODUCT_ALREADY_SOLD);
    }

    // 6. Create purchase record
    await tx.purchase.create({
      data: {
        productId: input.productId,
        channel: PurchaseChannel.DIRECT_CUSTOMER,
        finalPrice: new Prisma.Decimal(minimumPrice),
      },
    });

    // 7. Return success with coupon value
    return { ... };
  });
}
```

#### Reseller Purchase Flow (lines 74-128)

Same pattern with additional `reseller_price` validation.

---

## 🔍 Atomicity Protection Mechanisms

### 1. Prisma Transaction ✅
- All operations wrapped in `prisma.$transaction()`
- Ensures all-or-nothing execution
- Database-level isolation

### 2. Double Check Pattern ✅
- **First check** (line 36, 85): Read `isSold` flag
- **Atomic update** (line 42, 98): `updateMany` with condition `isSold: false`
- **Second check** (line 53, 109): Verify `updateResult.count > 0`

### 3. updateMany with Condition ✅
```typescript
const updateResult = await tx.coupon.updateMany({
  where: {
    productId: input.productId,
    isSold: false,  // ← Only updates if still false
  },
  data: {
    isSold: true,
    soldAt: new Date(),
  },
});
```

**Why this works:**
- `updateMany` is atomic at database level
- If `isSold` is already `true`, `updateResult.count === 0`
- This prevents race conditions even under concurrent requests

### 4. Error Code Mapping ✅
- `ConflictError` with `ERROR_CODES.PRODUCT_ALREADY_SOLD`
- Maps to HTTP 409 status code
- Consistent error format

---

## 🧪 Test Scenarios

### Scenario 1: First Purchase (Success)
1. Product exists with `isSold: false`
2. Call `POST /api/customer/products/:productId/purchase`
3. **Expected**: ✅ 200 OK with coupon value
4. **Database state**: `isSold: true`, `Purchase` record created

### Scenario 2: Second Purchase (Conflict)
1. Same product, now `isSold: true`
2. Call `POST /api/customer/products/:productId/purchase` again
3. **Expected**: ❌ 409 Conflict
4. **Response**: `{ "error_code": "PRODUCT_ALREADY_SOLD", "message": "The product has already been sold." }`

### Scenario 3: Concurrent Requests (Race Condition Protection)
1. Two requests arrive simultaneously for same product
2. Both read `isSold: false`
3. First request: `updateMany` succeeds, `count = 1`
4. Second request: `updateMany` fails, `count = 0` → throws 409
5. **Result**: Only one purchase succeeds ✅

---

## ✅ Verification Checklist

- [x] Transaction wrapper (`prisma.$transaction`)
- [x] Initial `isSold` check
- [x] Atomic `updateMany` with condition
- [x] `updateResult.count` verification
- [x] Proper error code (`PRODUCT_ALREADY_SOLD`)
- [x] HTTP 409 status code
- [x] Works for both customer and reseller flows

---

## 📝 Manual Test Instructions

### Prerequisites
1. Backend server running on `http://localhost:3000`
2. Database seeded with at least one product
3. Get a product ID from `GET /api/customer/products`

### Test Steps

#### Step 1: Get Available Product
```bash
curl http://localhost:3000/api/customer/products
# Note the first product's ID
```

#### Step 2: First Purchase (Should Succeed)
```bash
curl -X POST http://localhost:3000/api/customer/products/{PRODUCT_ID}/purchase \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "product_id": "...",
  "final_price": 100.00,
  "value_type": "STRING",
  "value": "ABCD-1234"
}
```

#### Step 3: Second Purchase (Should Fail with 409)
```bash
curl -X POST http://localhost:3000/api/customer/products/{SAME_PRODUCT_ID}/purchase \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "error_code": "PRODUCT_ALREADY_SOLD",
  "message": "The product has already been sold."
}
```

**Expected HTTP Status**: `409 Conflict`

---

## ✅ Conclusion

**Status**: ✅ **ATOMICITY PROPERLY IMPLEMENTED**

**Protection Mechanisms:**
1. ✅ Prisma transactions ensure atomicity
2. ✅ `updateMany` with condition prevents race conditions
3. ✅ Double-check pattern catches concurrent purchases
4. ✅ Proper error codes and HTTP status

**The implementation correctly prevents double-selling.**
