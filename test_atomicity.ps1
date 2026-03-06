# Atomicity Test Script (PowerShell)
# Tests that purchasing the same product twice returns 409 on second attempt

$API_BASE = "http://localhost:3000"
$PRODUCT_ID = ""

Write-Host "🧪 Testing Purchase Atomicity" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get available products
Write-Host "Step 1: Getting available products..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/api/customer/products" -Method Get
    if ($response.Count -eq 0) {
        Write-Host "❌ No products available. Please seed the database first." -ForegroundColor Red
        exit 1
    }
    $PRODUCT_ID = $response[0].id
    Write-Host "✅ Found product ID: $PRODUCT_ID" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get products: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: First purchase (should succeed)
Write-Host "Step 2: Attempting first purchase..." -ForegroundColor Yellow
try {
    $firstResponse = Invoke-RestMethod -Uri "$API_BASE/api/customer/products/$PRODUCT_ID/purchase" -Method Post -ErrorAction Stop
    Write-Host "✅ First purchase succeeded (HTTP 200)" -ForegroundColor Green
    Write-Host "Response: $($firstResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    Write-Host "❌ First purchase failed (HTTP $statusCode)" -ForegroundColor Red
    Write-Host "Response: $errorBody" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Second purchase (should fail with 409)
Write-Host "Step 3: Attempting second purchase (should fail)..." -ForegroundColor Yellow
try {
    $secondResponse = Invoke-RestMethod -Uri "$API_BASE/api/customer/products/$PRODUCT_ID/purchase" -Method Post -ErrorAction Stop
    Write-Host "❌ Second purchase should have failed, but succeeded!" -ForegroundColor Red
    Write-Host "Response: $($secondResponse | ConvertTo-Json -Compress)" -ForegroundColor Red
    exit 1
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    
    if ($statusCode -eq 409) {
        Write-Host "✅ Second purchase correctly rejected (HTTP 409)" -ForegroundColor Green
        if ($errorBody -match "PRODUCT_ALREADY_SOLD") {
            Write-Host "✅ Correct error code: PRODUCT_ALREADY_SOLD" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Warning: Error code might be incorrect" -ForegroundColor Yellow
        }
        Write-Host "Response: $errorBody" -ForegroundColor Gray
    } else {
        Write-Host "❌ Second purchase should have returned 409, but got HTTP $statusCode" -ForegroundColor Red
        Write-Host "Response: $errorBody" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

Write-Host "==============================" -ForegroundColor Cyan
Write-Host "✅ All atomicity tests passed!" -ForegroundColor Green
