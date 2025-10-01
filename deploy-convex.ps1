$env:CONVEX_SELF_HOSTED_URL = 'https://genral-data-bases-convex-1faac1-156-67-25-212.coderaai.com'
$env:CONVEX_SELF_HOSTED_ADMIN_KEY = 'convex-self-hosted|0185efb034c52cfe525327a12f3fdd37bf103207c7121d1cefb6fbd47a644bba10ee1167b8'

Write-Host "Deploying to self-hosted Convex..." -ForegroundColor Green
Write-Host "URL: $env:CONVEX_SELF_HOSTED_URL" -ForegroundColor Cyan

cd convex
npx convex dev --once --verbose
