#!/bin/bash

# Finance Tracker - Environment Variable Validation Script
# Validates that all required environment variables are set

set -e

echo "🔍 Checking environment variables..."

MISSING_VARS=0

# Function to check if variable is set
check_var() {
    local var_name=$1
    local file=$2
    
    if [ -f "$file" ]; then
        if grep -q "^${var_name}=your_" "$file" || ! grep -q "^${var_name}=" "$file"; then
            echo "❌ $var_name not configured in $file"
            MISSING_VARS=$((MISSING_VARS + 1))
        else
            echo "✅ $var_name configured"
        fi
    else
        echo "❌ File not found: $file"
        MISSING_VARS=$((MISSING_VARS + 1))
    fi
}

# Check root .env
echo ""
echo "Checking root .env..."
check_var "TELEGRAM_BOT_TOKEN" ".env"
check_var "RORK_API_KEY" ".env"
check_var "CONVEX_URL" ".env"

# Check bot .env
echo ""
echo "Checking bot/.env..."
check_var "TELEGRAM_BOT_TOKEN" "bot/.env"
check_var "CONVEX_URL" "bot/.env"
check_var "RORK_API_KEY" "bot/.env"

# Check convex .env.local
echo ""
echo "Checking convex/.env.local..."
check_var "RORK_API_KEY" "convex/.env.local"

echo ""
if [ $MISSING_VARS -eq 0 ]; then
    echo "✅ All environment variables are configured!"
    exit 0
else
    echo "❌ $MISSING_VARS environment variable(s) need configuration"
    echo ""
    echo "Please edit the .env files with your credentials:"
    echo "  - TELEGRAM_BOT_TOKEN: Get from @BotFather on Telegram"
    echo "  - RORK_API_KEY: Get from Rork dashboard"
    echo "  - CONVEX_URL: Run 'npx convex dev' in convex/ directory"
    exit 1
fi
