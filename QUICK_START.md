# Quick Start Guide

**Personal Finance Tracker Telegram Bot**  
**Version:** 0.2.0 (Epic 1 Complete)

---

## 🚀 Try the Live Bot

**Telegram Bot:** [@FinanceTracker_coderaai_bot](https://t.me/FinanceTracker_coderaai_bot)

### Available Commands

- `/start` - Register and see welcome message
- `/help` - View help and usage examples
- `/status` - Check bot and backend status

---

## 💻 Local Development Setup

### Prerequisites

- Node.js 18.x LTS or higher
- npm 9.x or higher
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- Convex account (free at [convex.dev](https://convex.dev))

### Quick Setup (5 minutes)

```bash
# 1. Clone and install
git clone <repository-url>
cd finance-tracker-telegram-bot
npm install

# 2. Set up environment variables
cp .env.example .env
cp bot/.env.example bot/.env

# Edit bot/.env and add:
# TELEGRAM_BOT_TOKEN=your_token_here

# 3. Initialize Convex
cd convex
npx convex dev
# Follow prompts, copy CONVEX_URL to bot/.env

# 4. Start the bot
cd ../bot
npm run dev
```

### Verify Installation

1. Open Telegram and find your bot
2. Send `/start` - you should get a welcome message
3. Send `/status` - should show "System operational"

---

## 📁 Project Structure

```
finance-tracker-telegram-bot/
├── bot/          - Telegram bot server
├── convex/       - Convex serverless backend
├── shared/       - Shared TypeScript types
├── docs/         - Documentation
└── scripts/      - Build scripts
```

---

## 🧪 Running Tests

```bash
# All tests
npm test

# Bot tests only
npm test --workspace=bot

# With coverage
npm test -- --coverage
```

**Current Test Status:** 95 tests passing, 90%+ coverage

---

## 📚 Documentation

### Getting Started

- [README](./README.md) - Full project documentation
- [SETUP](./SETUP.md) - Detailed setup instructions
- [Project Status](./PROJECT_STATUS.md) - Current progress

### Epic 1 (Complete)

- [Epic 1 Completion Summary](./docs/EPIC_1_COMPLETION_SUMMARY.md)
- [Epic 1 Retrospective](./docs/epic-1-retrospective.md)
- [Epic 1 PRD](./docs/prd/epic-1-foundation.md)

### Product & Requirements

- [PRD Overview](./docs/prd/README.md)
- [Epic List](./docs/prd/epics.md)
- [Requirements](./docs/prd/requirements.md)

### Technical

- [Architecture](./docs/architecture/README.md)
- [Coding Standards](./docs/architecture/coding-standards.md)
- [API Reference](./docs/api/users-api.md)

---

## 🔧 Common Tasks

### Start Development

```bash
# Terminal 1: Convex backend
cd convex
npx convex dev

# Terminal 2: Bot server
cd bot
npm run dev
```

### Deploy to Production

```bash
# Deploy Convex backend
cd convex
npx convex deploy

# Deploy bot (configure your hosting)
cd bot
npm run build
npm start
```

### Run Linting

```bash
npm run lint
npm run format
```

---

## 🎯 Current Features (Epic 1)

- ✅ Telegram bot integration
- ✅ User registration and profiles
- ✅ Convex serverless backend
- ✅ Bilingual support (English/Arabic)
- ✅ Welcome and help messages
- ✅ Health check system

---

## 🚧 Coming Soon (Epic 2)

- 🔄 Account creation (bank, cash, credit card)
- 🔄 Balance tracking
- 🔄 Account management
- 🔄 Multi-currency support

---

## 🐛 Troubleshooting

### Bot not responding

1. Check `TELEGRAM_BOT_TOKEN` in `bot/.env`
2. Ensure only one bot instance is running
3. Check bot logs for errors

### Convex connection errors

1. Verify `CONVEX_URL` in `bot/.env`
2. Run `npx convex dev` in convex directory
3. Check Convex dashboard for deployment status

### TypeScript errors

```bash
# Rebuild types
npm run build

# Clean and reinstall
rm -rf node_modules
npm install
```

---

## 📊 Project Status

**Overall Progress:** 20% (1/5 epics complete)

| Epic | Status | Progress |
|------|--------|----------|
| Epic 1: Foundation | ✅ Complete | 100% |
| Epic 2: Accounts | 🔄 Planned | 0% |
| Epic 3: Transactions | ⏳ Pending | 0% |
| Epic 4: Loans | ⏳ Pending | 0% |
| Epic 5: History | ⏳ Pending | 0% |

**Last Updated:** 2025-10-02

---

## 🤝 Contributing

1. Read [Coding Standards](./docs/architecture/coding-standards.md)
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit pull request

---

## 📞 Support

- **Issues:** Create a GitHub issue
- **Documentation:** Check [docs/](./docs/) directory
- **Live Bot:** [@FinanceTracker_coderaai_bot](https://t.me/FinanceTracker_coderaai_bot)

---

## 🏆 Team

- **Dev:** James (Development)
- **QA:** Quinn (Quality Assurance)
- **SM:** Bob (Scrum Master)
- **PM:** John (Product Management)

---

**Built with ❤️ using Convex and Telegram**
