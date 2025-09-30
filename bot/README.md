# Bot Server

This directory contains the Telegram bot server for the Personal Finance Tracker.

## Structure

- `src/index.ts` - Main entry point (Express server)
- `src/bot.ts` - Telegram bot initialization
- `src/config/` - Configuration and environment setup
- `src/handlers/` - Message and command handlers
- `src/services/` - Business logic services
- `src/utils/` - Utility functions
- `src/types/` - TypeScript type definitions
- `tests/` - Unit and integration tests

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token from @BotFather
- `CONVEX_URL` - Your Convex deployment URL
- `RORK_API_KEY` - Your Rork Toolkit API key
- `LOG_LEVEL` - Logging level (info, debug, error)

## Testing

Tests use Jest with ts-jest. Target coverage: 60%+ for handlers, 90%+ for utilities.
