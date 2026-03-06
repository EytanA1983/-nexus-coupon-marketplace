# Final Routes Map - Updated

## ✅ All Routes Updated

### System
```
GET  /health                      ✅ Health check
GET  /api                         ✅ Service info
GET  /api/version                 ✅ Version info
```

### Admin Auth
```
POST /api/admin/auth/login        ✅ Updated: username/password (was email/password)
GET  /api/admin/auth/me           ✅ Updated: new path (was /api/auth/me)
```

### Admin Products
```
GET    /api/admin/products        ✅ Updated: was /api/admin/coupons
POST   /api/admin/products        ✅ Updated: was /api/admin/coupons
GET    /api/admin/products/:id    ✅ Updated: was /api/admin/coupons/:id
PUT    /api/admin/products/:id    ✅ Updated: was /api/admin/coupons/:id
DELETE /api/admin/products/:id    ✅ Updated: was /api/admin/coupons/:id
GET    /api/admin/products/:id/stats  ✅ Stats endpoint
```

### Admin Purchases (NEW)
```
GET  /api/admin/purchases         ✅ NEW: Purchase history
```

### Customer API
```
GET  /api/customer/products       ✅ Already correct
GET  /api/customer/products/:productId  ✅ Already correct
POST /api/customer/products/:productId/purchase  ✅ Updated: no body, productId from URL
```

### Reseller API v1
```
GET  /api/v1/products             ✅ Updated: was /api/reseller/products
GET  /api/v1/products/:productId ✅ Updated: was /api/reseller/products/:id
POST /api/v1/products/:productId/purchase  ✅ Updated: body {reseller_price, reseller_name}
```

## Request/Response Examples

### Admin Login
```json
POST /api/admin/auth/login
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": { "id": "...", "email": "...", "role": "ADMIN" }
  }
}
```

### Customer Purchase
```json
POST /api/customer/products/{productId}/purchase
(no body)

Response:
{
  "success": true,
  "data": {
    "purchaseId": "...",
    "productId": "...",
    "productName": "...",
    "buyerType": "CUSTOMER",
    "purchasePrice": 48.00,
    "couponValue": 50.00,
    "status": "COMPLETED",
    "purchasedAt": "..."
  }
}
```

### Reseller Purchase
```json
POST /api/v1/products/{productId}/purchase
Authorization: Bearer <RESELLER_TOKEN>
{
  "reseller_price": 120.00,
  "reseller_name": "Acme Reseller"
}

Response:
{
  "success": true,
  "data": {
    "purchaseId": "...",
    "productId": "...",
    "productName": "...",
    "buyerType": "RESELLER",
    "purchasePrice": 120.00,
    "couponValue": 50.00,
    "status": "COMPLETED",
    "purchasedAt": "..."
  }
}
```

## Changes Summary

1. ✅ Admin auth moved to `/api/admin/auth/login`
2. ✅ Admin login now uses `username` instead of `email`
3. ✅ Admin products route changed from `/admin/coupons` to `/admin/products`
4. ✅ Added `/api/admin/purchases` endpoint
5. ✅ Customer purchase moved to `/api/customer/products/:productId/purchase` (no body)
6. ✅ Reseller routes moved to `/api/v1/products`
7. ✅ Reseller purchase body changed to `{reseller_price, reseller_name}`
