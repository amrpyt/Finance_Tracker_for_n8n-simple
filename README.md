# Personal Finance Tracker Telegram Bot

A bilingual (Arabic/English) Telegram bot for personal finance management, powered entirely by **Convex serverless architecture** with integrated AI and chart generation.

**🤖 Live Bot:** [@FinanceTracker_coderaai_bot](https://t.me/FinanceTracker_coderaai_bot)  
**📊 Project Status:** **Epic 7 Complete** ✅ - Full Convex-Only Migration  
**⚡ Architecture:** **Serverless-First** - No servers to manage!

## 🎯 Features

- **Natural Language Processing**: Add expenses and income using conversational language
- **Multi-Account Management**: Track multiple bank accounts, cash, and credit cards
- **Smart Categorization**: AI-powered transaction categorization using RORK
- **Chart Generation**: Beautiful expense charts (pie, bar, line) with QuickChart API
- **Bilingual Support**: Full Arabic and English language support
- **Real-time Balance Updates**: Instant balance calculations and updates
- **Serverless Architecture**: Fully serverless with Convex - no servers to manage!

## 🏗️ Architecture

**✨ Fully Serverless Convex-Only Architecture** - No servers, no infrastructure management!

```text
finance-tracker-telegram-bot/
├── convex/       - Complete serverless backend
│   ├── telegram.ts           - Webhook handler (HTTP Action)
│   ├── messageProcessor.ts   - Main message routing
│   ├── expenseActions.ts     - Expense/income logic
│   ├── balanceActions.ts     - Balance checking
│   ├── chartGenerator.ts     - Chart generation
│   ├── telegramAPI.ts        - Bot API integration
│   ├── rorkIntegration.ts    - AI processing
│   └── userProfiles.ts       - User management
└── docs/         - Project documentation
```

### Architecture Diagram

```text
┌─────────────┐
│   Telegram  │ 
│    Users    │
└──────┬──────┘
       │ Webhook
       ▼
┌─────────────────────────────┐
│   Convex HTTP Action        │
│  - Fast webhook handling    │
│  - <200ms acknowledgment    │
│  - Request validation       │
└──────────┬──────────────────┘
           │ Direct Processing
           ▼
┌─────────────────────────────┐
│   Convex Actions            │
│  - Message Processing       │
│  - AI Intent Detection      │
│  - Business Logic           │
│  - Chart Generation         │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│   External APIs             │
│  - RORK AI (Free)           │
│  - Telegram Bot API         │
│  - QuickChart (Free)        │
└─────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.x LTS or higher
- **npm**: 9.x or higher  
- **Telegram Bot Token**: Get from [@BotFather](https://t.me/botfather)
- **Convex Account**: Sign up at [convex.dev](https://convex.dev)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd finance-tracker-telegram-bot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Initialize Convex**

   ```bash
   npx convex dev
   # Follow the prompts to create a new project
   # This will generate your CONVEX_URL automatically
   ```

4. **Configure environment variables**

   In the Convex dashboard, add these environment variables:
   - `TELEGRAM_BOT_TOKEN` - Your bot token from @BotFather

5. **Deploy to production**

   ```bash
   npm run deploy
   ```

6. **Set up Telegram webhook**

   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
        -H "Content-Type: application/json" \
        -d '{"url":"<YOUR_CONVEX_HTTP_ACTION_URL>/telegram/webhook"}'
   ```

### Development Workflow

```bash
# Start development server
npm run dev

# Deploy to production  
npm run deploy

# Format code
npm run format
```

## 📁 Project Structure

### Convex Backend (`/convex/`)

- `telegram.ts` - Webhook handler (HTTP Action)
- `messageProcessor.ts` - Main message routing and AI integration
- `expenseActions.ts` - Expense and income processing
- `balanceActions.ts` - Balance checking and transaction history
- `chartGenerator.ts` - Chart generation with QuickChart API
- `telegramAPI.ts` - Telegram Bot API integration
- `rorkIntegration.ts` - AI processing with RORK
- `userProfiles.ts` - User management and preferences
- `schema.ts` - Database schema definition
- `_generated/` - Convex generated files

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token from @BotFather | Yes |
| `CONVEX_URL` | Convex deployment URL (auto-generated by `npx convex dev`) | Yes |
| `LOG_LEVEL` | Logging level (info/debug/error) | No |
| `PORT` | Bot server port (default: 3000) | No |

### API Configuration

**Rork Toolkit API** configuration is in `config.api.json`:
- Base URL: `https://toolkit.rork.com`
- Endpoints: `/text/llm/` for natural language processing
- Rate limits: 60 requests/minute recommended
- Retry policies: 3 retries with exponential backoff
- Timeout: 5000ms

**Note:** Rork API credentials will be configured in Story 3.1 when AI integration is implemented.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run bot tests only
npm test --workspace=bot

# Run Convex tests only
npm test --workspace=convex

# Run with coverage
npm test -- --coverage
```

### Test Coverage Requirements
- **Convex Functions**: 80%+ coverage
- **Bot Handlers**: 60%+ coverage
- **Utilities**: 90%+ coverage

## 📚 Documentation

### Project Management

- [Project Status](PROJECT_STATUS.md) - Current progress and metrics
- [Epic 1 Retrospective](docs/epic-1-retrospective.md) - Lessons learned

### Product & Requirements

- [Product Requirements](docs/prd/README.md)
- [Epic List](docs/prd/epics.md)
- [Requirements](docs/prd/requirements.md)

### Technical Documentation

- [Architecture Overview](docs/architecture/README.md)
- [High-Level Architecture](docs/architecture/high-level-architecture.md)
- [Coding Standards](docs/architecture/coding-standards.md)
- [Tech Stack](docs/architecture/tech-stack.md)
- [API Reference](docs/api/users-api.md)

## 🚢 Deployment

### Bot Server (Railway)
```bash
# Deploy to Railway
npm run deploy:bot
```

### Convex Backend
```bash
# Deploy to Convex Cloud
cd convex
npx convex deploy
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 18.x LTS
- **Language**: TypeScript 5.3+
- **Bot Framework**: node-telegram-bot-api
- **Backend**: Convex (serverless)
- **AI/NLP**: Rork Toolkit
- **Testing**: Jest (bot), Vitest (Convex)
- **Code Quality**: ESLint, Prettier

## 📝 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines here]

## 📧 Support

For issues and questions:
- Create an issue on GitHub
- Contact: [your-email@example.com]

---

**Built with ❤️ using Convex and Telegram**
