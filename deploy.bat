@echo off
echo ========================================
echo Finance Tracker Bot - VPS Deployment
echo Story 2.2: List All Accounts
echo ========================================
echo.

echo Connecting to VPS and deploying...
echo.

ssh root@156.67.25.212 "cd /root/Finance_Tracker_for_n8n-simple && git pull origin master && cd bot && npm install && pkill -f node || true && nohup npm run dev > ../bot.log 2>&1 & sleep 3 && tail -n 20 ../bot.log"

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Test bot on Telegram: @FinanceTracker_coderaai_bot
echo 2. Send "show accounts" to verify
echo 3. Check logs if needed
echo.
pause
