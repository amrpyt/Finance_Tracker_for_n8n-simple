# Deploy Convex functions to self-hosted instance using HTTP API
$CONVEX_URL = "https://genral-data-bases-convex-1faac1-156-67-25-212.coderaai.com"
$ADMIN_KEY = "convex-self-hosted|0185efb034c52cfe525327a12f3fdd37bf103207c7121d1cefb6fbd47a644bba10ee1167b8"

Write-Host "Deploying Convex functions to self-hosted instance..." -ForegroundColor Green
Write-Host "URL: $CONVEX_URL" -ForegroundColor Cyan

# Read the function files
$usersJs = Get-Content -Path "convex/users.js" -Raw
$schemaJs = Get-Content -Path "convex/schema.js" -Raw

# Create deployment payload
$modules = @{
    "users.js" = $usersJs
    "schema.js" = $schemaJs
}

# Convert to JSON
$payload = @{
    modules = $modules
} | ConvertTo-Json -Depth 10

# Deploy using HTTP API
$headers = @{
    "Authorization" = "Convex $ADMIN_KEY"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "$CONVEX_URL/api/deploy" -Method Post -Headers $headers -Body $payload
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "❌ Deployment failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host $_.Exception.Response
}
