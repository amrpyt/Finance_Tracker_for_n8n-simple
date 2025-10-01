# Final deployment script - Run from local machine
$env:CONVEX_SELF_HOSTED_URL = 'https://genral-data-bases-convex-1faac1-156-67-25-212.coderaai.com'
$env:CONVEX_SELF_HOSTED_ADMIN_KEY = 'convex-self-hosted|0185efb034c52cfe525327a12f3fdd37bf103207c7121d1cefb6fbd47a644bba10ee1167b8'

Write-Host "🚀 Deploying to self-hosted Convex..." -ForegroundColor Green
Write-Host "URL: $env:CONVEX_SELF_HOSTED_URL" -ForegroundColor Cyan

# Change to convex directory
Set-Location convex

# Try deployment
npx convex deploy --verbose

# Return to root
Set-Location ..

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "Test with: node test-user-registration.js" -ForegroundColor Yellow
