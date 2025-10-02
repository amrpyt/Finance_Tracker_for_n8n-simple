# Finance Tracker Bot - VPS Deployment Script (PowerShell)
# Story 2.2: List All Accounts with Balances
# Date: 2025-10-02

Write-Host "🚀 Starting deployment to VPS..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# VPS Configuration
$VPS_HOST = "156.67.25.212"
$VPS_USER = "root"
$VPS_PASSWORD = "2QEOc478Wp9eYpivhhhQ2e"
$PROJECT_PATH = "/root/Finance_Tracker_for_n8n-simple"

Write-Host "📡 Connecting to VPS: $VPS_USER@$VPS_HOST" -ForegroundColor Yellow
Write-Host ""

# Create SSH command script
$sshCommands = @"
cd $PROJECT_PATH || exit 1
echo '✅ Found project directory'
echo ''
echo '📥 Pulling latest code...'
git pull origin master || exit 1
echo '✅ Code updated'
echo ''
cd bot
echo '📦 Installing dependencies...'
npm install
echo '✅ Dependencies ready'
echo ''
echo '🔍 Checking for running bot...'
pkill -f 'node.*index.ts' || true
sleep 2
echo '🚀 Starting bot...'
nohup npm run dev > ../bot.log 2>&1 &
sleep 3
echo '✅ Bot started'
echo ''
tail -n 10 ../bot.log
"@

# Execute via SSH (requires SSH client)
try {
    Write-Host "Executing deployment commands..." -ForegroundColor Yellow
    
    # Using plink (PuTTY) if available, otherwise use ssh
    if (Get-Command plink -ErrorAction SilentlyContinue) {
        echo "y" | plink -pw $VPS_PASSWORD "$VPS_USER@$VPS_HOST" $sshCommands
    } else {
        # Try standard ssh (will prompt for password)
        ssh "$VPS_USER@$VPS_HOST" $sshCommands
    }
    
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "✅ Deployment completed!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Test bot: @FinanceTracker_coderaai_bot" -ForegroundColor White
    Write-Host "2. Send 'show accounts' to verify" -ForegroundColor White
    Write-Host "3. Check logs if needed" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Error during deployment:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Manual deployment steps:" -ForegroundColor Yellow
    Write-Host "1. Open PuTTY or SSH client" -ForegroundColor White
    Write-Host "2. Connect to: $VPS_USER@$VPS_HOST" -ForegroundColor White
    Write-Host "3. Password: $VPS_PASSWORD" -ForegroundColor White
    Write-Host "4. Run the commands from deploy-to-vps.sh" -ForegroundColor White
    Write-Host ""
}
