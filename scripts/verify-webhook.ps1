# Telegram Webhook Verification Script
# Verifies webhook is properly configured and tests basic connectivity

param(
    [Parameter(Mandatory=$true)]
    [string]$BotToken,
    
    [Parameter(Mandatory=$false)]
    [string]$WebhookUrl = "https://ceaseless-cardinal-528.convex.cloud/telegram/webhookHandler"
)

Write-Host "🔍 Telegram Bot Webhook Verification" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Get Bot Info
Write-Host "Test 1: Verifying Bot Token..." -ForegroundColor Yellow
$getBotUrl = "https://api.telegram.org/bot$BotToken/getMe"

try {
    $botInfo = Invoke-RestMethod -Uri $getBotUrl -Method Get
    if ($botInfo.ok) {
        Write-Host "✅ Bot Token Valid" -ForegroundColor Green
        Write-Host "   Bot Name: $($botInfo.result.first_name)" -ForegroundColor Gray
        Write-Host "   Username: @$($botInfo.result.username)" -ForegroundColor Gray
        Write-Host "   Bot ID: $($botInfo.result.id)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Bot Token Invalid" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Failed to connect to Telegram API" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Get Current Webhook Info
Write-Host "Test 2: Checking Current Webhook..." -ForegroundColor Yellow
$getWebhookUrl = "https://api.telegram.org/bot$BotToken/getWebhookInfo"

try {
    $webhookInfo = Invoke-RestMethod -Uri $getWebhookUrl -Method Get
    if ($webhookInfo.ok) {
        $currentUrl = $webhookInfo.result.url
        if ($currentUrl) {
            Write-Host "✅ Webhook Currently Set" -ForegroundColor Green
            Write-Host "   URL: $currentUrl" -ForegroundColor Gray
            Write-Host "   Pending Updates: $($webhookInfo.result.pending_update_count)" -ForegroundColor Gray
            
            if ($webhookInfo.result.last_error_date) {
                Write-Host "   ⚠️  Last Error: $($webhookInfo.result.last_error_message)" -ForegroundColor Yellow
                Write-Host "   Error Date: $(Get-Date -UnixTimeSeconds $webhookInfo.result.last_error_date)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "⚠️  No Webhook Set" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Failed to get webhook info" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Set Webhook (if different)
if ($currentUrl -ne $WebhookUrl) {
    Write-Host "Test 3: Setting Webhook URL..." -ForegroundColor Yellow
    Write-Host "   Target: $WebhookUrl" -ForegroundColor Gray
    
    $setWebhookUrl = "https://api.telegram.org/bot$BotToken/setWebhook"
    $body = @{
        url = $WebhookUrl
        allowed_updates = @("message", "callback_query")
        drop_pending_updates = $false
    } | ConvertTo-Json
    
    try {
        $setResult = Invoke-RestMethod -Uri $setWebhookUrl -Method Post -Body $body -ContentType "application/json"
        if ($setResult.ok) {
            Write-Host "✅ Webhook Set Successfully" -ForegroundColor Green
            Write-Host "   Description: $($setResult.description)" -ForegroundColor Gray
        } else {
            Write-Host "❌ Failed to set webhook" -ForegroundColor Red
            Write-Host "   Error: $($setResult.description)" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ Failed to set webhook" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Test 3: Webhook Already Correct" -ForegroundColor Green
}

Write-Host ""

# Test 4: Verify Webhook is Reachable
Write-Host "Test 4: Testing Webhook Endpoint..." -ForegroundColor Yellow

try {
    # Try to reach the webhook URL (should return 405 for GET)
    $testResult = Invoke-WebRequest -Uri $WebhookUrl -Method Get -ErrorAction SilentlyContinue
    Write-Host "⚠️  Webhook responds to GET (should only accept POST)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 405) {
        Write-Host "✅ Webhook Correctly Rejects GET Requests" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Webhook returned: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Test 5: Get Updates (check if webhook is receiving)
Write-Host "Test 5: Checking Recent Updates..." -ForegroundColor Yellow
$getUpdatesUrl = "https://api.telegram.org/bot$BotToken/getUpdates?limit=1"

try {
    $updates = Invoke-RestMethod -Uri $getUpdatesUrl -Method Get
    if ($updates.ok) {
        if ($updates.result.Count -gt 0) {
            Write-Host "⚠️  Updates in Queue (webhook may not be working)" -ForegroundColor Yellow
            Write-Host "   Pending Updates: $($updates.result.Count)" -ForegroundColor Gray
            Write-Host "   Note: If webhook is working, this should be 0" -ForegroundColor Gray
        } else {
            Write-Host "✅ No Pending Updates (webhook is processing)" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "⚠️  Could not check updates" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "📋 Verification Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Bot: @$($botInfo.result.username)" -ForegroundColor White
Write-Host "Webhook: $WebhookUrl" -ForegroundColor White
Write-Host ""
Write-Host "✅ Next Steps:" -ForegroundColor Green
Write-Host "   1. Open Telegram and find your bot" -ForegroundColor Gray
Write-Host "   2. Send: /start" -ForegroundColor Gray
Write-Host "   3. Verify you receive a welcome message" -ForegroundColor Gray
Write-Host "   4. Check Convex Dashboard logs for webhook activity" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Monitor at: https://dashboard.convex.dev" -ForegroundColor Cyan
Write-Host ""
