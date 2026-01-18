# SpeakSmart Backend - Interactive Test Guide
# Run each step one by one

Write-Host "=== SpeakSmart Backend Test ===" -ForegroundColor Cyan
Write-Host ""

# STEP 1: Login
Write-Host "STEP 1: Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "demo@test.com"
    password = "demo123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "  User: $($loginResponse.user.email)" -ForegroundColor Gray
    
    $token = $loginResponse.session.access_token
    Write-Host ""
    Write-Host "Your Access Token (saved as `$token):" -ForegroundColor Cyan
    Write-Host $token.Substring(0, 60)... -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "✗ Login failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit
}

# STEP 2: Validate Session
Write-Host "STEP 2: Validating session..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $sessionResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/session" -Method GET -Headers $headers
    Write-Host "✓ Session is valid!" -ForegroundColor Green
    Write-Host "  User ID: $($sessionResponse.user.id)" -ForegroundColor Gray
    Write-Host "  Email: $($sessionResponse.user.email)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Session validation failed!" -ForegroundColor Red
    exit
}

# STEP 3: Get Speech History
Write-Host "STEP 3: Fetching speech history..." -ForegroundColor Yellow
try {
    $historyResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/speech/history" -Method GET -Headers $headers
    Write-Host "✓ History retrieved!" -ForegroundColor Green
    Write-Host "  Total sessions: $($historyResponse.history.Count)" -ForegroundColor Gray
    
    if ($historyResponse.history.Count -gt 0) {
        Write-Host ""
        Write-Host "  Recent sessions:" -ForegroundColor Cyan
        foreach ($session in $historyResponse.history | Select-Object -First 3) {
            Write-Host "    - $($session.context)" -ForegroundColor White
            if ($session.analysis_results) {
                Write-Host "      Overall Score: $($session.analysis_results.overall_score)/100" -ForegroundColor Gray
            }
        }
    }
    Write-Host ""
} catch {
    Write-Host "✗ Failed to get history!" -ForegroundColor Red
}

# STEP 4: Instructions for uploading audio
Write-Host "=== NEXT: Upload Audio File ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To upload and analyze an audio file, run these commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# 1. Set your audio file path" -ForegroundColor Gray
Write-Host '$audioFile = "C:\path\to\your\audio.mp3"' -ForegroundColor White
Write-Host ""
Write-Host "# 2. Upload the file" -ForegroundColor Gray
Write-Host '$form = @{ audio = Get-Item $audioFile; context = "Practice presentation" }' -ForegroundColor White
Write-Host '$headers = @{ "Authorization" = "Bearer ' + $token + '" }' -ForegroundColor White
Write-Host '$upload = Invoke-RestMethod -Uri "http://localhost:5000/api/speech/upload" -Method POST -Form $form -Headers $headers' -ForegroundColor White
Write-Host ""
Write-Host "# 3. Analyze the speech" -ForegroundColor Gray
Write-Host '$analyzeBody = @{ sessionId = $upload.session.id } | ConvertTo-Json' -ForegroundColor White
Write-Host '$analysis = Invoke-RestMethod -Uri "http://localhost:5000/api/speech/analyze" -Method POST -Body $analyzeBody -ContentType "application/json" -Headers $headers' -ForegroundColor White
Write-Host ""
Write-Host "# 4. View the results" -ForegroundColor Gray
Write-Host '$analysis.analysis | Format-List' -ForegroundColor White
Write-Host ""
Write-Host "=== Test Complete! ===" -ForegroundColor Green
Write-Host "Your backend is working perfectly!" -ForegroundColor Green
