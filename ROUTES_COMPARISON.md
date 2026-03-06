# Routes Comparison - Current vs Required

## Current Routes

```
GET  /health
GET  /api
GET  /api/version

POST /api/auth/login              # email/password
GET  /api/auth/me

GET  /api/admin/coupons
POST /api/admin/coupons
GET  /api/admin/coupons/:id
PUT  /api/admin/coupons/:id
DELETE /api/admin/coupons/:id
GET  /api/admin/coupons/:id/stats

GET  /api/customer/products
GET  /api/customer/products/:id
POST /api/customer/purchase       # body: {productId}

GET  /api/reseller/products
GET  /api/reseller/products/:id
POST /api/reseller/purchase       # body: {productId, resellerPrice}
```

## Required Routes

```
GET  /health                       ✅ Already exists

POST /api/admin/auth/login        # username/password (CHANGE)
GET  /api/admin/auth/me           # (NEW PATH)

GET  /api/admin/products           # (CHANGE from /admin/coupons)
POST /api/admin/products          # (CHANGE)
GET  /api/admin/products/:productId  # (CHANGE)
PUT  /api/admin/products/:productId  # (CHANGE)
DELETE /api/admin/products/:productId # (CHANGE)
GET  /api/admin/purchases         # (NEW)

GET  /api/customer/products       ✅ Already exists
GET  /api/customer/products/:productId  ✅ Already exists
POST /api/customer/products/:productId/purchase  # (CHANGE - no body)

GET  /api/v1/products             # (CHANGE from /reseller/products)
GET  /api/v1/products/:productId  # (CHANGE)
POST /api/v1/products/:productId/purchase  # (CHANGE - body: {reseller_price, reseller_name})
```

## Changes Needed

1. **Admin Auth**: `/api/auth/login` → `/api/admin/auth/login` + username instead of email
2. **Admin Products**: `/api/admin/coupons` → `/api/admin/products`
3. **Admin Purchases**: Add new `/api/admin/purchases` endpoint
4. **Customer Purchase**: `/api/customer/purchase` → `/api/customer/products/:productId/purchase` (no body)
5. **Reseller Base**: `/api/reseller/*` → `/api/v1/products/*`
6. **Reseller Purchase**: Change to `/api/v1/products/:productId/purchase` with `{reseller_price, reseller_name}` body
