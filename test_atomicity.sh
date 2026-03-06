#!/bin/bash

# Atomicity Test Script
# Tests that purchasing the same product twice returns 409 on second attempt

API_BASE="http://localhost:3000"
PRODUCT_ID=""

echo "🧪 Testing Purchase Atomicity"
echo "=============================="
echo ""

# Step 1: Get available products
echo "Step 1: Getting available products..."
PRODUCTS=$(curl -s "$API_BASE/api/customer/products")

if [ -z "$PRODUCTS" ] || [ "$PRODUCTS" == "[]" ]; then
  echo "❌ No products available. Please seed the database first."
  exit 1
fi

# Extract first product ID (simple extraction, assumes JSON array)
PRODUCT_ID=$(echo "$PRODUCTS" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$PRODUCT_ID" ]; then
  echo "❌ Could not extract product ID from response"
  echo "Response: $PRODUCTS"
  exit 1
fi

echo "✅ Found product ID: $PRODUCT_ID"
echo ""

# Step 2: First purchase (should succeed)
echo "Step 2: Attempting first purchase..."
FIRST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/customer/products/$PRODUCT_ID/purchase" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$FIRST_RESPONSE" | tail -1)
BODY=$(echo "$FIRST_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ First purchase succeeded (HTTP $HTTP_CODE)"
  echo "Response: $BODY"
else
  echo "❌ First purchase failed (HTTP $HTTP_CODE)"
  echo "Response: $BODY"
  exit 1
fi
echo ""

# Step 3: Second purchase (should fail with 409)
echo "Step 3: Attempting second purchase (should fail)..."
SECOND_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/customer/products/$PRODUCT_ID/purchase" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$SECOND_RESPONSE" | tail -1)
BODY=$(echo "$SECOND_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" == "409" ]; then
  echo "✅ Second purchase correctly rejected (HTTP $HTTP_CODE)"
  if echo "$BODY" | grep -q "PRODUCT_ALREADY_SOLD"; then
    echo "✅ Correct error code: PRODUCT_ALREADY_SOLD"
  else
    echo "⚠️  Warning: Error code might be incorrect"
  fi
  echo "Response: $BODY"
else
  echo "❌ Second purchase should have returned 409, but got HTTP $HTTP_CODE"
  echo "Response: $BODY"
  exit 1
fi
echo ""

echo "=============================="
echo "✅ All atomicity tests passed!"
