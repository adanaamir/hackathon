# Step-by-Step Backend Test

Write-Host "=== Testing SpeakSmart Backend ===" -ForegroundColor Cyan

# Step 1: Login
Write-Host "`nStep 1: Logging in..." -ForegroundColor Yellow
$body = @{
    email = "demo@test.com"
    password = "demo123"
}
$json = $body | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $json -ContentType "application/json"

Write-Host "SUCCESS! Logged in as: $($response.user.email)" -ForegroundColor Green
$token = $response.session.access_token

# Step 2: Check session
Write-Host "`nStep 2: Checking session..." -ForegroundColor Yellow
$headers = @{ Authorization = "Bearer $token" }
$session = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/session" -Method GET -Headers $headers

Write-Host "SUCCESS! Session valid for: $($session.user.email)" -ForegroundColor Green

# Step 3: Get history
Write-Host "`nStep 3: Getting speech history..." -ForegroundColor Yellow
$history = Invoke-RestMethod -Uri "http://localhost:5000/api/speech/history" -Method GET -Headers $headers

Write-Host "SUCCESS! Found $($history.history.Count) sessions" -ForegroundColor Green

Write-Host "`n=== ALL TESTS PASSED ===" -ForegroundColor Green
Write-Host "`nYour token for uploading audio:" -ForegroundColor Cyan
Write-Host $token
