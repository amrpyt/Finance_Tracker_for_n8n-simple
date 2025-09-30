#!/bin/bash

# Finance Tracker Telegram Bot - Setup Script
# This script automates the initial project setup

set -e

echo "🚀 Starting Finance Tracker setup..."

# Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18.x or higher is required"
    echo "   Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Check npm version
echo "📋 Checking npm version..."
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 9 ]; then
    echo "❌ Error: npm 9.x or higher is required"
    echo "   Current version: $(npm -v)"
    exit 1
fi
echo "✅ npm version: $(npm -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install workspace dependencies
echo "📦 Installing workspace dependencies..."
npm install --workspaces

# Check environment files
echo "🔍 Checking environment files..."
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "   Creating from .env.example..."
    cp .env.example .env
    echo "   Please edit .env with your credentials"
fi

if [ ! -f "bot/.env" ]; then
    echo "⚠️  Warning: bot/.env file not found"
    echo "   Creating from bot/.env.example..."
    cp bot/.env.example bot/.env
    echo "   Please edit bot/.env with your credentials"
fi

if [ ! -f "convex/.env.local" ]; then
    echo "⚠️  Warning: convex/.env.local file not found"
    echo "   Creating from convex/.env.local.example..."
    cp convex/.env.local.example convex/.env.local
    echo "   Please edit convex/.env.local with your credentials"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env files with your API keys and tokens"
echo "   2. Run 'cd convex && npx convex dev' to initialize Convex"
echo "   3. Copy the CONVEX_URL to your .env files"
echo "   4. Run 'npm run dev' to start the bot"
echo ""
