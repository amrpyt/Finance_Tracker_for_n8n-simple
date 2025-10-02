#!/bin/bash

# Finance Tracker Bot - VPS Deployment Script
# Story 2.2: List All Accounts with Balances
# Date: 2025-10-02

set -e  # Exit on any error

echo "🚀 Starting deployment to VPS..."
echo "================================"

# VPS Configuration
VPS_HOST="156.67.25.212"
VPS_USER="root"
VPS_PASSWORD="2QEOc478Wp9eYpivhhhQ2e"
PROJECT_PATH="/root/Finance_Tracker_for_n8n-simple"  # Adjust if different

echo ""
echo "📡 Connecting to VPS: $VPS_USER@$VPS_HOST"
echo ""

# SSH and deploy
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" << 'ENDSSH'

echo "✅ Connected to VPS"
echo ""

# Navigate to project directory
echo "📁 Navigating to project directory..."
cd /root/Finance_Tracker_for_n8n-simple || {
    echo "❌ Error: Project directory not found!"
    echo "Please specify the correct path in the script."
    exit 1
}

echo "✅ Found project directory: $(pwd)"
echo ""

# Pull latest changes
echo "📥 Pulling latest code from repository..."
git fetch origin
git pull origin master || {
    echo "❌ Error: Failed to pull from repository"
    exit 1
}

echo "✅ Code updated successfully"
echo ""

# Navigate to bot directory
echo "📂 Navigating to bot directory..."
cd bot || {
    echo "❌ Error: Bot directory not found!"
    exit 1
}

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "📦 Updating dependencies..."
    npm install
fi

echo "✅ Dependencies ready"
echo ""

# Check if bot is running
echo "🔍 Checking for running bot process..."
BOT_PID=$(pgrep -f "node.*index.ts" || echo "")

if [ -n "$BOT_PID" ]; then
    echo "🛑 Stopping existing bot process (PID: $BOT_PID)..."
    kill $BOT_PID
    sleep 2
    echo "✅ Bot stopped"
else
    echo "ℹ️  No running bot process found"
fi

echo ""

# Start bot in background
echo "🚀 Starting bot..."
nohup npm run dev > ../bot.log 2>&1 &
NEW_PID=$!

sleep 3

# Check if bot started successfully
if ps -p $NEW_PID > /dev/null; then
    echo "✅ Bot started successfully (PID: $NEW_PID)"
    echo ""
    echo "📋 Last 10 lines of log:"
    tail -n 10 ../bot.log
else
    echo "❌ Error: Bot failed to start"
    echo "📋 Log output:"
    cat ../bot.log
    exit 1
fi

echo ""
echo "================================"
echo "✅ Deployment completed successfully!"
echo "================================"
echo ""
echo "📊 Bot Status:"
echo "  - Process ID: $NEW_PID"
echo "  - Log file: /root/Finance_Tracker_for_n8n-simple/bot.log"
echo ""
echo "📝 Useful commands:"
echo "  - View logs: tail -f /root/Finance_Tracker_for_n8n-simple/bot.log"
echo "  - Check process: ps aux | grep node"
echo "  - Stop bot: kill $NEW_PID"
echo ""

ENDSSH

echo ""
echo "🎉 Deployment script completed!"
echo ""
echo "Next steps:"
echo "1. Test the bot on Telegram: @FinanceTracker_coderaai_bot"
echo "2. Send 'show accounts' to verify Story 2.2"
echo "3. Monitor logs for any errors"
echo ""
