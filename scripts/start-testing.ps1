# Start Testing Session
# Opens all necessary resources for testing Story 7.1

Write-Host "🧪 Starting Test Session for Story 7.1" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# 1. Open Convex Dashboard
Write-Host "📊 Opening Convex Dashboard..." -ForegroundColor Yellow
Start-Process "https://dashboard.convex.dev"
Start-Sleep -Seconds 2

# 2. Open Telegram Web (optional)
Write-Host "💬 Opening Telegram Web..." -ForegroundColor Yellow
Start-Process "https://web.telegram.org"
Start-Sleep -Seconds 2

# 3. Open Test Log in VS Code
Write-Host "📝 Opening Test Log..." -ForegroundColor Yellow
$testLogPath = Join-Path $PSScriptRoot "..\TEST_EXECUTION_LOG.md"
if (Test-Path $testLogPath) {
    code $testLogPath
} else {
    Write-Host "⚠️  Test log not found at: $testLogPath" -ForegroundColor Yellow
}
Start-Sleep -Seconds 1

# 4. Open Quick Reference
Write-Host "📖 Opening Quick Reference..." -ForegroundColor Yellow
$quickRefPath = Join-Path $PSScriptRoot "..\QUICK_TEST_REFERENCE.md"
if (Test-Path $quickRefPath) {
    code $quickRefPath
} else {
    Write-Host "⚠️  Quick reference not found" -ForegroundColor Yellow
}
Start-Sleep -Seconds 1

# 5. Check if Convex dev is running
Write-Host ""
Write-Host "🔍 Checking Convex Status..." -ForegroundColor Yellow
$convexProcess = Get-Process | Where-Object {$_.ProcessName -eq "node" -and $_.StartTime -gt (Get-Date).AddMinutes(-30)} | Select-Object -First 1

if ($convexProcess) {
    Write-Host "✅ Convex dev appears to be running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Convex dev may not be running" -ForegroundColor Yellow
    Write-Host "   Run: npx convex dev" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "✅ Test Session Ready!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Check Convex Dashboard (should be open)" -ForegroundColor Gray
Write-Host "   2. Open Telegram (web or app)" -ForegroundColor Gray
Write-Host "   3. Find bot: @FinanceTracker_coderaai_bot" -ForegroundColor Gray
Write-Host "   4. Follow TEST_EXECUTION_LOG.md (should be open)" -ForegroundColor Gray
Write-Host "   5. Use QUICK_TEST_REFERENCE.md for commands" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 Start with: /start" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Monitor logs at: https://dashboard.convex.dev" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to verify webhook
Write-Host "❓ Do you want to verify/set webhook now? (Y/N): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "🔧 Please enter your Telegram Bot Token:" -ForegroundColor Yellow
    $botToken = Read-Host -AsSecureString
    $botTokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($botToken))
    
    if ($botTokenPlain) {
        Write-Host ""
        Write-Host "🔄 Verifying webhook..." -ForegroundColor Yellow
        $webhookScript = Join-Path $PSScriptRoot "verify-webhook.ps1"
        if (Test-Path $webhookScript) {
            & $webhookScript -BotToken $botTokenPlain
        } else {
            Write-Host "❌ Webhook script not found" -ForegroundColor Red
        }
    }
} else {
    Write-Host ""
    Write-Host "⏭️  Skipping webhook verification" -ForegroundColor Gray
    Write-Host "   You can run it later: .\scripts\verify-webhook.ps1" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🚀 Happy Testing!" -ForegroundColor Green
Write-Host ""
