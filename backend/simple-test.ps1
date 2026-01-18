# Simple API Test - Step by Step

# Step 1: Register a user
Write-Host "Step 1: Registering user..." -ForegroundColor Cyan
$signup = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" `
    -Method POST `
    -Body '{"email":"demo@test.com","password":"demo123","fullName":"Demo User"}' `
    -ContentType "application/json"

Write-Host "Success! User created:" -ForegroundColor Green
$signup | ConvertTo-Json

# Step 2: Login
Write-Host "`nStep 2: Logging in..." -ForegroundColor Cyan
$login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -Body '{"email":"demo@test.com","password":"demo123"}' `
    -ContentType "application/json"

$token = $login.session.access_token
Write-Host "Success! Logged in. Token:" -ForegroundColor Green
Write-Host $token.Substring(0, 50)...

# Step 3: Check session
Write-Host "`nStep 3: Validating session..." -ForegroundColor Cyan
$session = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/session" `
    -Method GET `
    -Headers @{Authorization="Bearer $token"}

Write-Host "Success! Session valid for:" -ForegroundColor Green
$session.user | ConvertTo-Json

Write-Host "`n=== READY TO USE ===" -ForegroundColor Yellow
Write-Host "Save this token to upload audio:" -ForegroundColor White
Write-Host $token
