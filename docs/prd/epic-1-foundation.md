# Epic 1: Foundation & Telegram Bot Setup

**Version:** 1.0  
**Date:** 2025-09-30  
**Epic ID:** Epic 1  
**Status:** ✅ **COMPLETE** (Closed: 2025-10-02)

---

## Goal

Establish the foundational project structure with Convex backend, Telegram bot integration, and basic conversational capabilities. This epic delivers a working bot that can receive messages, respond intelligently, and demonstrate the core conversational paradigm, even if financial features are minimal. By the end of this epic, users can start the bot, receive a welcome message, and interact with a simple echo or help system.

## Epic Summary

**Completion Date:** 2025-10-02  
**Stories Completed:** 5/5 (100%)  
**QA Gates:** 5/5 PASS  
**Test Coverage:** 95 automated tests passing  
**Deployment Status:** Live on Telegram (@FinanceTracker_coderaai_bot)

### Key Achievements
- ✅ Monorepo structure with bot/convex/shared packages
- ✅ Telegram bot operational with polling mode
- ✅ Convex serverless backend deployed
- ✅ User registration and profile management
- ✅ Bilingual support (English/Arabic)
- ✅ Comprehensive documentation and testing infrastructure

---

## Story 1.1: Project Initialization & Repository Setup

**As a** developer,  
**I want** a properly structured monorepo with Convex and bot directories,  
**so that** I have a clean foundation for building the application.

### Acceptance Criteria

1. Repository created with `/convex` and `/bot` directories
2. Convex project initialized with `npx convex dev` and basic schema file created
3. Bot directory contains package.json with `node-telegram-bot-api` or equivalent dependency
4. README.md created with project overview, setup instructions, and architecture diagram
5. `.gitignore` configured to exclude `node_modules`, `.env`, and Convex local files
6. Environment variable template (`.env.example`) created for `TELEGRAM_BOT_TOKEN`, `RORK_API_KEY`, `CONVEX_URL`
7. Git repository initialized with initial commit

---

## Story 1.2: Telegram Bot Registration & Basic Connection

**As a** user,  
**I want** to find and start the Telegram bot,  
**so that** I can begin interacting with my financial assistant.

### Acceptance Criteria

1. Telegram bot created via BotFather with unique username and token obtained
2. Bot server connects to Telegram API successfully using token from environment variables
3. Bot responds to `/start` command with a simple welcome message (e.g., "Hello! I'm your finance bot.")
4. Bot handles `/help` command with placeholder help text
5. Bot logs incoming messages to console for debugging
6. Connection errors are caught and logged with clear error messages
7. Bot can be stopped and restarted without errors

---

## Story 1.3: Convex Backend Integration & Health Check

**As a** developer,  
**I want** the bot server to communicate with Convex backend,  
**so that** I can store and retrieve data reliably.

### Acceptance Criteria

1. Convex client SDK integrated into bot server with deployment URL from environment
2. Simple Convex query function created (e.g., `getSystemStatus`) that returns a health check message
3. Bot server successfully calls Convex query on startup and logs result
4. `/status` command added to bot that queries Convex and returns system status to user
5. Error handling implemented for Convex connection failures with user-friendly message
6. Convex function execution logged in Convex dashboard for verification
7. Round-trip latency measured and logged (bot → Convex → bot)

---

## Story 1.4: User Registration & Profile Creation

**As a** new user,  
**I want** my profile automatically created when I start the bot,  
**so that** my data is isolated and secure.

### Acceptance Criteria

1. Convex `users` table schema defined with fields: `telegramUserId`, `username`, `firstName`, `languagePreference`, `createdAt`
2. Convex mutation function `createOrGetUser` created that inserts user if not exists, returns existing user otherwise
3. Bot calls `createOrGetUser` on `/start` command with Telegram user data
4. User profile stored in Convex database with Telegram user ID as unique identifier
5. Welcome message personalized with user's first name (e.g., "Welcome, Ahmed!")
6. Language preference defaults to "ar" (Arabic) but can be detected from Telegram settings
7. User creation logged in Convex dashboard with timestamp

---

## Story 1.5: Welcome Message & Onboarding Tutorial

**As a** new user,  
**I want** a clear welcome message with usage examples,  
**so that** I understand how to use the bot without reading documentation.

### Acceptance Criteria

1. `/start` command triggers comprehensive welcome message with bot capabilities overview
2. Welcome message includes 3-5 example commands in both Arabic and English (e.g., "دفعت 50 على القهوة" / "paid 50 for coffee")
3. Welcome message explains core features: expense logging, income tracking, account management, loan tracking
4. Message formatted with Telegram markdown (bold, italic) and emoji for visual clarity
5. `/help` command displays similar guidance with command reference
6. Onboarding message stored as reusable template in code (not hardcoded in handler)
7. Message length optimized for mobile viewing (under 300 words)

---

**Related Documents:**
- [Epic List](./epics.md)
- [Epic 2: Account Management](./epic-2-accounts.md)
- [Requirements](./requirements.md)
- [Technical Assumptions](./technical-assumptions.md)
