# SpeakSmart API Test Script

Write-Host "=== SpeakSmart API Testing ===" -ForegroundColor Cyan

# 1. Register User
Write-Host "`n1. Registering new user..." -ForegroundColor Yellow
$signupBody = @{
    email = "test@example.com"
    password = "password123"
    fullName = "Test User"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -Body $signupBody -ContentType "application/json"
    Write-Host "✓ User registered successfully!" -ForegroundColor Green
    Write-Host "User ID: $($signupResponse.user.id)" -ForegroundColor Gray
} catch {
    Write-Host "Note: User might already exist, trying login..." -ForegroundColor Yellow
}

# 2. Login
Write-Host "`n2. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.session.access_token
Write-Host "✓ Login successful!" -ForegroundColor Green
Write-Host "Token: $($token.Substring(0,20))..." -ForegroundColor Gray

# 3. Validate Session
Write-Host "`n3. Validating session..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}
$sessionResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/session" -Method GET -Headers $headers
Write-Host "✓ Session valid! User: $($sessionResponse.user.email)" -ForegroundColor Green

# 4. Get History
Write-Host "`n4. Fetching speech history..." -ForegroundColor Yellow
$historyResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/speech/history" -Method GET -Headers $headers
Write-Host "✓ Found $($historyResponse.history.Count) previous sessions" -ForegroundColor Green

Write-Host "`n=== All Tests Passed! ===" -ForegroundColor Cyan
Write-Host "`nYour access token (save this for audio upload):" -ForegroundColor Yellow
Write-Host $token -ForegroundColor White

Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
Write-Host "To upload and analyze audio, run these commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host '# 1. Set your audio file path' -ForegroundColor Gray
Write-Host '$audioFile = "C:\path\to\your\audio.mp3"' -ForegroundColor White
Write-Host ""
Write-Host '# 2. Upload the audio' -ForegroundColor Gray
Write-Host '$form = @{ audio = Get-Item $audioFile; context = "Practice presentation" }' -ForegroundColor White
Write-Host '$headers = @{ "Authorization" = "Bearer ' + $token + '" }' -ForegroundColor White
Write-Host '$upload = Invoke-RestMethod -Uri "http://localhost:5000/api/speech/upload" -Method POST -Form $form -Headers $headers' -ForegroundColor White
Write-Host ""
Write-Host '# 3. Analyze the speech' -ForegroundColor Gray
Write-Host '$analyzeBody = @{ sessionId = $upload.session.id } | ConvertTo-Json' -ForegroundColor White
Write-Host '$analysis = Invoke-RestMethod -Uri "http://localhost:5000/api/speech/analyze" -Method POST -Body $analyzeBody -ContentType "application/json" -Headers $headers' -ForegroundColor White
Write-Host ""
Write-Host '# 4. View results' -ForegroundColor Gray
Write-Host '$analysis.analysis | ConvertTo-Json -Depth 10' -ForegroundColor White
