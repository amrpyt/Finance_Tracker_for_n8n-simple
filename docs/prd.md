# Personal Finance Tracker (Telegram Bot) Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** 2025-09-30  
**Status:** Draft

> **📁 This document has been sharded for easier navigation. See [docs/prd/README.md](./prd/README.md) for the complete sharded structure.**

---

## Sharded Documents

This PRD is now organized into focused documents:

- **[Overview](./prd/overview.md)** - Goals, background, and change log
- **[Requirements](./prd/requirements.md)** - Functional and non-functional requirements  
- **[UI Design Goals](./prd/ui-design.md)** - UX vision and interaction paradigms
- **[Technical Assumptions](./prd/technical-assumptions.md)** - Architecture and testing approach
- **[Epic List](./prd/epics.md)** - All epics with detailed user stories

---

## Goals and Background Context

### Goals

- Enable users to track personal finances through natural conversation in Telegram without installing dedicated apps
- Reduce daily finance tracking time from 5-10 minutes to under 30 seconds per transaction
- Provide AI-powered natural language understanding in Arabic and English with 85%+ transaction categorization accuracy
- Track multiple financial accounts (bank accounts, cash, credit cards) with real-time balance visibility
- Monitor loans lent to friends/family with payment tracking to prevent financial leakage
- Achieve AI agent response time under 2 seconds for all user interactions
- Reach 1,000 active users within 3 months with 60% weekly engagement and 40% 30-day retention rate

### Background Context

Traditional personal finance apps create friction through complex UIs, mandatory installations, and lack of Arabic language support, resulting in 70% of users abandoning them within a month. Arabic-speaking individuals particularly lack quality financial tools that fit their cultural context and daily habits. This solution delivers a Telegram-based personal financial assistant that meets users where they already are—in their messaging app—using AI to understand natural language inputs and automatically categorize transactions. Users can log expenses in 5 seconds through simple chat messages like "دفعت 50 جنيه على القهوة" (I paid 50 pounds for coffee). The system specifically addresses the informal loan tracking problem common in Middle Eastern cultures where lending money to friends and family is frequent but poorly tracked, helping users recover outstanding loans and maintain financial awareness.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-09-30 | 1.0 | Initial PRD draft based on Project Brief | John (PM) |

---

## Requirements

### Functional

- **FR1:** The system shall allow users to initiate interaction via Telegram `/start` command and receive a welcome message with quick tutorial
- **FR2:** The system shall accept natural language expense inputs in Arabic and English (e.g., "دفعت 50 جنيه على القهوة" or "paid 50 for coffee")
- **FR3:** The system shall extract transaction amount, description, and implied category from natural language input using AI
- **FR4:** The system shall present extracted transaction details to user for confirmation before saving
- **FR5:** The system shall allow users to create and name multiple accounts (bank account, cash, credit card)
- **FR6:** The system shall track current balance for each account, updating automatically with transactions
- **FR7:** The system shall allow users to log income via natural language (e.g., "استلمت راتب 5000" or "received salary 5000")
- **FR8:** The system shall allow users to create loan records with borrower name, amount, and date
- **FR9:** The system shall allow users to record partial payments against existing loans
- **FR10:** The system shall calculate and display remaining loan balance after payments
- **FR11:** The system shall provide instant balance overview across all accounts via command or natural language query
- **FR12:** The system shall display recent transaction history (last 10-20 transactions) on request
- **FR13:** The system shall allow users to edit or delete transactions within a reasonable time window
- **FR14:** The system shall support both Arabic and English language interfaces with automatic language detection
- **FR15:** The system shall use function calling to automatically route user intents to appropriate backend operations
- **FR16:** The system shall isolate user data by Telegram user ID with no cross-user data access
- **FR17:** The system shall provide help command to display available bot capabilities and example commands

### Non Functional

- **NFR1:** AI agent response time must be under 2 seconds for 95% of user interactions
- **NFR2:** AI transaction categorization accuracy must achieve 85% or higher on natural language inputs
- **NFR3:** System must maintain 99.5% uptime availability
- **NFR4:** System must support 1,000+ concurrent users without performance degradation
- **NFR5:** System must handle 10,000+ transactions per user without slowdown
- **NFR6:** All user data must be encrypted at rest using platform default encryption
- **NFR7:** System must operate within Convex free tier limits initially (1M function calls/month)
- **NFR8:** System must respect Telegram Bot API rate limits (30 messages/second)
- **NFR9:** System must implement rate limiting on AI API calls to prevent abuse
- **NFR10:** User interface must be conversational with no forms or complex navigation required
- **NFR11:** System must provide graceful error messages in user's language when operations fail
- **NFR12:** Time to first transaction must be under 2 minutes from bot start for new users

---

## User Interface Design Goals

### Overall UX Vision

A completely conversational interface where users interact with the bot as if chatting with a financial assistant. No buttons, forms, or menus—pure natural language interaction. The bot should feel intelligent, helpful, and non-judgmental about spending habits. Responses should be concise (1-3 sentences) to match messaging app conventions, with emoji usage for visual clarity (💰 for money, 📊 for reports, ✅ for confirmations).

### Key Interaction Paradigms

- **Natural Language First:** Users type freely without learning commands or syntax
- **Confirmation Pattern:** Bot extracts intent, presents interpretation, asks for confirmation before committing changes
- **Contextual Awareness:** Bot remembers recent conversation context (e.g., "add another 20" after logging expense)
- **Proactive Feedback:** Bot provides immediate balance updates after transactions
- **Error Recovery:** If bot misunderstands, user can simply rephrase or type "no" to cancel

### Core Screens and Views

From a product perspective, the critical interaction flows are:

- **Welcome/Onboarding Flow:** First-time user greeting with quick tutorial examples
- **Transaction Logging Flow:** User input → AI extraction → Confirmation → Balance update
- **Balance Check Flow:** User query → Account summary display
- **Loan Creation Flow:** User input → Borrower/amount extraction → Confirmation → Loan record created
- **Loan Payment Flow:** User input → Loan selection → Payment amount → Updated balance
- **Transaction History View:** List of recent transactions with dates, amounts, descriptions
- **Account Management Flow:** Create/rename/view accounts

### Accessibility: None

MVP focuses on core functionality. Accessibility features (screen reader support, high contrast) deferred to post-MVP.

### Branding

Minimal branding. Bot should feel professional yet friendly. Use clear, simple language. Emoji usage for visual hierarchy (💰 money, 🏦 bank, 👤 person for loans, 📅 dates). No custom graphics or complex styling—rely on Telegram's native message formatting (bold, italic, code blocks).

### Target Device and Platforms: Web Responsive

Telegram (iOS, Android, Web, Desktop). The bot must work seamlessly across all Telegram platforms with no platform-specific features. Responsive to any device that runs Telegram.

---

## Technical Assumptions

### Repository Structure: Monorepo

Single repository with two main directories:
- `/convex` - Backend functions, database schema, AI integration
- `/bot` - Telegram bot server (Node.js or Python)

### Service Architecture

**Hybrid Architecture:**
- **Telegram Bot Server:** Lightweight Node.js/Python server handling Telegram webhook or polling
- **Convex Backend:** Serverless TypeScript functions for business logic, database operations, and AI calls
- **Communication:** Bot server calls Convex via HTTP Actions or Convex Client SDK
- **AI Integration:** Convex functions call Rork Toolkit API for natural language processing

**Rationale:** This architecture leverages Convex's strengths (real-time database, serverless scaling) while keeping bot logic separate for easier testing and potential multi-platform expansion (WhatsApp, etc.).

### Testing Requirements

**Unit + Integration Testing:**
- **Unit Tests:** Core business logic in Convex functions (transaction creation, balance calculation, loan tracking)
- **Integration Tests:** End-to-end flows from Telegram message → AI processing → Database update → Response
- **Manual Testing:** Natural language understanding accuracy requires human validation with diverse Arabic/English inputs
- **Test Data:** Create sample user profiles with realistic transaction patterns for regression testing

**Rationale:** AI-driven systems require both automated testing for logic and manual testing for language understanding quality.

### Additional Technical Assumptions and Requests

- **Language/Runtime:** TypeScript for Convex functions, Node.js (TypeScript) or Python for bot server
- **Bot Framework:** `node-telegram-bot-api` (Node.js) or `python-telegram-bot` (Python)
- **AI/LLM Provider:** Rork Toolkit API (existing config in `config.api.json`) - no OpenAI/Anthropic
- **Database:** Convex built-in database with JSON documents and relational model
- **Deployment:** Convex auto-deploys backend; bot server on free tier hosting (Railway, Render, or Fly.io)
- **Environment Variables:** Telegram Bot Token, Rork API credentials, Convex deployment URL
- **Error Handling:** Implement retry logic for AI API calls with exponential backoff
- **Logging:** Structured logging for debugging AI interpretation errors and transaction issues
- **Data Model:** Tables for `users`, `accounts`, `transactions`, `loans`, `loan_payments`
- **Rate Limiting:** Implement per-user rate limits to prevent spam (max 10 transactions/minute)
- **Localization:** Store user language preference (Arabic/English) in user profile for consistent responses
- **Currency:** Default to Egyptian Pounds (EGP) for MVP; currency symbol detection from user input

---

## Epic List

### Epic 1: Foundation & Telegram Bot Setup
Establish project infrastructure, Telegram bot integration, and basic conversational interface to enable users to interact with the bot and receive responses.

### Epic 2: Account Management & Balance Tracking
Enable users to create and manage multiple financial accounts (bank, cash, credit card) with real-time balance tracking.

### Epic 3: Expense & Income Logging with AI
Implement AI-powered natural language processing to log expenses and income, automatically extracting amounts and descriptions from user messages.

### Epic 4: Loan Tracking & Payment Management
Enable users to track money lent to others, record loan payments, and view outstanding loan balances.

### Epic 5: Transaction History & Data Management
Provide users with transaction history viewing, editing, and deletion capabilities for complete financial data control.

---

## Epic 1: Foundation & Telegram Bot Setup

**Goal:** Establish the foundational project structure with Convex backend, Telegram bot integration, and basic conversational capabilities. This epic delivers a working bot that can receive messages, respond intelligently, and demonstrate the core conversational paradigm, even if financial features are minimal. By the end of this epic, users can start the bot, receive a welcome message, and interact with a simple echo or help system.

### Story 1.1: Project Initialization & Repository Setup

**As a** developer,  
**I want** a properly structured monorepo with Convex and bot directories,  
**so that** I have a clean foundation for building the application.

#### Acceptance Criteria

1. Repository created with `/convex` and `/bot` directories
2. Convex project initialized with `npx convex dev` and basic schema file created
3. Bot directory contains package.json with `node-telegram-bot-api` or equivalent dependency
4. README.md created with project overview, setup instructions, and architecture diagram
5. `.gitignore` configured to exclude `node_modules`, `.env`, and Convex local files
6. Environment variable template (`.env.example`) created for `TELEGRAM_BOT_TOKEN`, `RORK_API_KEY`, `CONVEX_URL`
7. Git repository initialized with initial commit

### Story 1.2: Telegram Bot Registration & Basic Connection

**As a** user,  
**I want** to find and start the Telegram bot,  
**so that** I can begin interacting with my financial assistant.

#### Acceptance Criteria

1. Telegram bot created via BotFather with unique username and token obtained
2. Bot server connects to Telegram API successfully using token from environment variables
3. Bot responds to `/start` command with a simple welcome message (e.g., "Hello! I'm your finance bot.")
4. Bot handles `/help` command with placeholder help text
5. Bot logs incoming messages to console for debugging
6. Connection errors are caught and logged with clear error messages
7. Bot can be stopped and restarted without errors

### Story 1.3: Convex Backend Integration & Health Check

**As a** developer,  
**I want** the bot server to communicate with Convex backend,  
**so that** I can store and retrieve data reliably.

#### Acceptance Criteria

1. Convex client SDK integrated into bot server with deployment URL from environment
2. Simple Convex query function created (e.g., `getSystemStatus`) that returns a health check message
3. Bot server successfully calls Convex query on startup and logs result
4. `/status` command added to bot that queries Convex and returns system status to user
5. Error handling implemented for Convex connection failures with user-friendly message
6. Convex function execution logged in Convex dashboard for verification
7. Round-trip latency measured and logged (bot → Convex → bot)

### Story 1.4: User Registration & Profile Creation

**As a** new user,  
**I want** my profile automatically created when I start the bot,  
**so that** my data is isolated and secure.

#### Acceptance Criteria

1. Convex `users` table schema defined with fields: `telegramUserId`, `username`, `firstName`, `languagePreference`, `createdAt`
2. Convex mutation function `createOrGetUser` created that inserts user if not exists, returns existing user otherwise
3. Bot calls `createOrGetUser` on `/start` command with Telegram user data
4. User profile stored in Convex database with Telegram user ID as unique identifier
5. Welcome message personalized with user's first name (e.g., "Welcome, Ahmed!")
6. Language preference defaults to "ar" (Arabic) but can be detected from Telegram settings
7. User creation logged in Convex dashboard with timestamp

### Story 1.5: Welcome Message & Onboarding Tutorial

**As a** new user,  
**I want** a clear welcome message with usage examples,  
**so that** I understand how to use the bot without reading documentation.

#### Acceptance Criteria

1. `/start` command triggers comprehensive welcome message with bot capabilities overview
2. Welcome message includes 3-5 example commands in both Arabic and English (e.g., "دفعت 50 على القهوة" / "paid 50 for coffee")
3. Welcome message explains core features: expense logging, income tracking, account management, loan tracking
4. Message formatted with Telegram markdown (bold, italic) and emoji for visual clarity
5. `/help` command displays similar guidance with command reference
6. Onboarding message stored as reusable template in code (not hardcoded in handler)
7. Message length optimized for mobile viewing (under 300 words)

---

## Epic 2: Account Management & Balance Tracking

**Goal:** Enable users to create, manage, and view multiple financial accounts (bank accounts, cash, credit cards) with real-time balance tracking. This epic delivers the foundational data model for all financial transactions and allows users to check their balances instantly via natural language queries.

### Story 2.1: Account Creation via Natural Language

**As a** user,  
**I want** to create a new account by typing a simple message,  
**so that** I can start tracking my finances without complex forms.

#### Acceptance Criteria

1. Convex `accounts` table schema defined with fields: `userId`, `name`, `type`, `balance`, `currency`, `createdAt`
2. Convex mutation `createAccount` accepts account name, type (bank/cash/credit), and initial balance
3. Bot detects account creation intent from messages like "create bank account" or "أضف حساب نقدي"
4. Bot prompts for account name if not provided (e.g., "What should I call this account?")
5. Bot prompts for initial balance (defaults to 0 if not provided)
6. Account created in database linked to user's Telegram ID
7. Confirmation message sent with account details (e.g., "✅ Created 'Main Bank' with balance 5000 EGP")

### Story 2.2: List All Accounts with Balances

**As a** user,  
**I want** to view all my accounts and their current balances,  
**so that** I have a complete overview of my finances.

#### Acceptance Criteria

1. Convex query `getUserAccounts` retrieves all accounts for a specific user
2. Bot responds to commands like "show accounts", "list accounts", "عرض الحسابات"
3. Response formatted as a list with account name, type, and balance (e.g., "🏦 Main Bank: 5000 EGP")
4. Total balance across all accounts calculated and displayed at the end
5. Empty state handled gracefully (e.g., "You don't have any accounts yet. Create one by typing 'create account'")
6. Accounts sorted by creation date (oldest first)
7. Response uses emoji for visual clarity (🏦 bank, 💵 cash, 💳 credit card)

### Story 2.3: Default Account Selection

**As a** user,  
**I want** one account to be my default for transactions,  
**so that** I don't have to specify the account every time I log an expense.

#### Acceptance Criteria

1. `accounts` table includes `isDefault` boolean field
2. First account created automatically set as default
3. Convex mutation `setDefaultAccount` allows changing default account
4. Bot responds to commands like "set Main Bank as default" or "اجعل الحساب النقدي الافتراضي"
5. Only one account can be default at a time (setting new default removes flag from previous)
6. Default account indicated in account list with ⭐ emoji
7. Confirmation message sent when default changed (e.g., "⭐ 'Main Bank' is now your default account")

### Story 2.4: Account Balance Updates (Manual)

**As a** user,  
**I want** to manually adjust an account balance,  
**so that** I can correct errors or sync with my actual bank balance.

#### Acceptance Criteria

1. Convex mutation `updateAccountBalance` accepts account ID and new balance
2. Bot detects balance update intent from messages like "set Main Bank balance to 3000" or "عدل رصيد الحساب النقدي إلى 500"
3. Bot confirms current balance and asks for confirmation before updating
4. Balance updated in database with timestamp
5. Confirmation message sent with old and new balance (e.g., "Updated 'Main Bank': 5000 → 3000 EGP")
6. Balance change logged as a special transaction type for audit trail
7. Negative balances allowed (for credit cards or overdrafts)

### Story 2.5: Instant Balance Check via Natural Language

**As a** user,  
**I want** to ask "what's my balance?" and get an instant answer,  
**so that** I can quickly check my finances without navigating menus.

#### Acceptance Criteria

1. Bot detects balance query intent from messages like "balance", "كم رصيدي", "how much do I have?"
2. If user has one account, balance displayed immediately
3. If user has multiple accounts, default account balance shown with option to see all
4. Response includes account name and balance (e.g., "💰 Main Bank: 3000 EGP")
5. Response time under 2 seconds from message to reply
6. Query works in both Arabic and English with language detection
7. Handles edge cases: no accounts (prompts to create one), zero balance (displays "0 EGP")

---

## Epic 3: Expense & Income Logging with AI

**Goal:** Implement AI-powered natural language processing using Rork Toolkit API to enable users to log expenses and income through conversational messages. The AI extracts transaction details (amount, description, category) and presents them for user confirmation before saving. This epic delivers the core value proposition of zero-friction financial tracking.

### Story 3.1: Rork Toolkit API Integration

**As a** developer,  
**I want** Convex functions to call Rork Toolkit API for natural language understanding,  
**so that** the bot can intelligently interpret user messages.

#### Acceptance Criteria

1. Rork Toolkit API credentials loaded from `config.api.json` or environment variables
2. Convex action `callRorkAPI` created to send messages to Rork LLM endpoint
3. API request includes system prompt defining bot's role and capabilities
4. API response parsed to extract structured data (intent, entities, confidence)
5. Error handling for API failures (timeout, rate limit, invalid response) with retry logic
6. API call latency logged for performance monitoring
7. Function calling capability tested with sample prompts and verified in Convex logs

### Story 3.2: Expense Logging with AI Extraction

**As a** user,  
**I want** to type "paid 50 for coffee" and have the bot understand and log it,  
**so that** I can track expenses without structured commands.

#### Acceptance Criteria

1. Convex `transactions` table schema defined with fields: `userId`, `accountId`, `type` (expense/income), `amount`, `description`, `category`, `date`, `createdAt`
2. Bot sends user message to Rork API with prompt to extract: amount, description, implied category
3. AI response parsed to extract transaction details
4. Bot presents extracted details to user for confirmation (e.g., "💸 Expense: 50 EGP for 'coffee' from Main Bank. Confirm?")
5. User can confirm (✅), cancel (❌), or edit details by replying
6. On confirmation, transaction saved to database and account balance decremented
7. Confirmation message includes updated balance (e.g., "✅ Logged! New balance: 2950 EGP")

### Story 3.3: Income Logging with AI Extraction

**As a** user,  
**I want** to type "received salary 5000" and have it logged as income,  
**so that** I can track all money coming in.

#### Acceptance Criteria

1. Bot detects income intent from keywords like "received", "earned", "استلمت", "حصلت على"
2. AI extracts amount and description from user message
3. Bot presents extracted income details for confirmation (e.g., "💰 Income: 5000 EGP for 'salary' to Main Bank. Confirm?")
4. On confirmation, transaction saved with type='income' and account balance incremented
5. Confirmation message includes updated balance
6. Income transactions distinguished from expenses in database and future queries
7. Handles edge cases: missing amount (prompts user), ambiguous description (asks for clarification)

### Story 3.4: Transaction Categorization

**As a** user,  
**I want** my expenses automatically categorized (food, transport, shopping, etc.),  
**so that** I can understand my spending patterns without manual tagging.

#### Acceptance Criteria

1. AI prompt includes instruction to infer category from transaction description
2. Categories defined: Food & Dining, Transportation, Shopping, Bills & Utilities, Entertainment, Health, Other
3. AI returns category with confidence score
4. Category stored in `transactions` table
5. Low-confidence categorizations (< 70%) flagged as "Other" with option for user to correct
6. Bot displays category in confirmation message (e.g., "💸 Expense: 50 EGP for 'coffee' (Food & Dining)")
7. Category accuracy measured and logged for future AI prompt optimization

### Story 3.5: Multi-Account Transaction Support

**As a** user,  
**I want** to specify which account an expense comes from,  
**so that** I can track spending across different accounts accurately.

#### Acceptance Criteria

1. Bot detects account specification in messages like "paid 50 from credit card" or "دفعت 50 من البنك"
2. If account not specified, default account used automatically
3. AI extracts account name from user message and matches to existing accounts
4. If account name ambiguous or not found, bot asks for clarification with account list
5. Transaction linked to specified account in database
6. Account balance updated for the correct account
7. Confirmation message includes account name (e.g., "✅ Logged to Credit Card! New balance: 1500 EGP")

---

## Epic 4: Loan Tracking & Payment Management

**Goal:** Enable users to track money lent to friends and family, record loan payments, and view outstanding loan balances. This epic addresses a key pain point for Arabic-speaking users where informal lending is common but poorly tracked, helping users recover outstanding loans and maintain financial awareness.

### Story 4.1: Loan Creation via Natural Language

**As a** user,  
**I want** to log a loan by typing "lent Ahmed 500",  
**so that** I can track money I've given to others.

#### Acceptance Criteria

1. Convex `loans` table schema defined with fields: `userId`, `borrowerName`, `amount`, `currency`, `dateLent`, `status` (active/paid), `createdAt`
2. Bot detects loan creation intent from keywords like "lent", "loan", "أقرضت", "سلفت"
3. AI extracts borrower name and amount from user message
4. Bot presents extracted loan details for confirmation (e.g., "👤 Loan: 500 EGP to Ahmed. Confirm?")
5. On confirmation, loan saved to database with status='active'
6. Confirmation message sent (e.g., "✅ Loan recorded! Ahmed owes you 500 EGP")
7. Loan does not affect account balances (assumes cash already given)

### Story 4.2: List All Active Loans

**As a** user,  
**I want** to view all outstanding loans,  
**so that** I know who owes me money.

#### Acceptance Criteria

1. Convex query `getUserLoans` retrieves all loans for a user, filtered by status
2. Bot responds to commands like "show loans", "list loans", "عرض القروض"
3. Response formatted as list with borrower name, amount, and date lent (e.g., "👤 Ahmed: 500 EGP (lent 2025-09-15)")
4. Total outstanding loan amount calculated and displayed
5. Empty state handled (e.g., "You don't have any active loans")
6. Loans sorted by date lent (oldest first)
7. Paid loans excluded from default view but accessible via "show all loans" command

### Story 4.3: Record Loan Payment

**As a** user,  
**I want** to log when someone repays part of a loan,  
**so that** I can track remaining balances accurately.

#### Acceptance Criteria

1. Convex `loan_payments` table schema defined with fields: `loanId`, `amount`, `datePaid`, `createdAt`
2. Bot detects payment intent from messages like "Ahmed paid 200" or "أحمد دفع 200"
3. AI extracts borrower name and payment amount
4. Bot matches borrower name to active loans and confirms (e.g., "Ahmed paid 200 EGP toward 500 EGP loan?")
5. On confirmation, payment record created and linked to loan
6. Remaining loan balance calculated (original amount - sum of payments)
7. Confirmation message includes remaining balance (e.g., "✅ Payment recorded! Ahmed now owes 300 EGP")

### Story 4.4: Mark Loan as Fully Paid

**As a** user,  
**I want** loans to automatically close when fully repaid,  
**so that** my active loan list stays clean.

#### Acceptance Criteria

1. After each payment, system calculates remaining balance (loan amount - total payments)
2. If remaining balance ≤ 0, loan status automatically updated to 'paid'
3. Confirmation message indicates loan closure (e.g., "✅ Loan fully repaid! Ahmed's loan is now closed.")
4. Paid loans excluded from active loan list but retained in database for history
5. User can manually mark loan as paid via command like "mark Ahmed loan as paid"
6. Manual closure requires confirmation to prevent accidental data loss
7. Overpayments handled gracefully (remaining balance shows as 0, not negative)

### Story 4.5: Loan Details & Payment History

**As a** user,  
**I want** to view detailed payment history for a specific loan,  
**so that** I can track repayment progress over time.

#### Acceptance Criteria

1. Bot responds to commands like "show Ahmed loan details" or "تفاصيل قرض أحمد"
2. Response includes: borrower name, original amount, date lent, total paid, remaining balance
3. Payment history listed chronologically with dates and amounts
4. If no payments made, displays "No payments yet"
5. Response formatted clearly with emoji and markdown for readability
6. Works for both active and paid loans
7. If multiple loans exist for same borrower, bot asks for clarification or shows all

---

## Epic 5: Transaction History & Data Management

**Goal:** Provide users with comprehensive transaction history viewing, editing, and deletion capabilities for complete financial data control. This epic ensures users can review past transactions, correct errors, and maintain accurate financial records, building trust in the system.

### Story 5.1: View Recent Transaction History

**As a** user,  
**I want** to view my recent transactions,  
**so that** I can review my spending and income.

#### Acceptance Criteria

1. Convex query `getRecentTransactions` retrieves last 20 transactions for a user, sorted by date descending
2. Bot responds to commands like "show transactions", "history", "عرض المعاملات"
3. Response formatted as list with date, type (expense/income), amount, description, account
4. Expenses shown with 💸 emoji, income with 💰 emoji
5. Each transaction numbered for easy reference (e.g., "1. 2025-09-30: 💸 50 EGP - coffee (Main Bank)")
6. Empty state handled (e.g., "No transactions yet. Start by logging an expense!")
7. Response paginated if more than 20 transactions (with "show more" option)

### Story 5.2: Filter Transactions by Date Range

**As a** user,  
**I want** to view transactions from a specific time period,  
**so that** I can analyze my spending for a particular week or month.

#### Acceptance Criteria

1. Bot detects date range filters from messages like "show last week", "transactions this month", "معاملات الشهر الماضي"
2. AI extracts date range (start and end dates) from user message
3. Convex query filters transactions by date range
4. Response includes date range in header (e.g., "Transactions from 2025-09-01 to 2025-09-30:")
5. Total expenses and income for period calculated and displayed
6. Net change (income - expenses) shown at end
7. Handles relative dates (today, yesterday, last week, this month) and absolute dates (2025-09-15)

### Story 5.3: Edit Transaction Details

**As a** user,  
**I want** to correct a transaction if I made a mistake,  
**so that** my financial records are accurate.

#### Acceptance Criteria

1. Convex mutation `updateTransaction` accepts transaction ID and updated fields (amount, description, category)
2. Bot responds to commands like "edit transaction 3" or "change last transaction"
3. Bot displays current transaction details and asks what to change
4. User can specify new amount, description, or category
5. Account balance adjusted to reflect the change (difference between old and new amount)
6. Confirmation message shows old and new values (e.g., "Updated: 50 EGP → 55 EGP for 'coffee'")
7. Edit timestamp logged for audit trail

### Story 5.4: Delete Transaction

**As a** user,  
**I want** to delete a transaction if it was logged incorrectly,  
**so that** my records don't include erroneous data.

#### Acceptance Criteria

1. Convex mutation `deleteTransaction` accepts transaction ID and marks as deleted (soft delete)
2. Bot responds to commands like "delete transaction 5" or "remove last transaction"
3. Bot displays transaction details and asks for confirmation before deleting
4. On confirmation, transaction marked as deleted (not physically removed from database)
5. Account balance adjusted to reverse the transaction
6. Confirmation message sent (e.g., "✅ Deleted: 50 EGP for 'coffee'. Balance updated to 3000 EGP")
7. Deleted transactions excluded from history views but retained in database for audit

### Story 5.5: Transaction Search by Description

**As a** user,  
**I want** to search for transactions by keyword,  
**so that** I can quickly find specific expenses or income.

#### Acceptance Criteria

1. Convex query `searchTransactions` accepts search term and filters by description
2. Bot responds to commands like "find coffee transactions" or "ابحث عن مواصلات"
3. Search is case-insensitive and supports partial matches
4. Results formatted as numbered list with date, amount, description, account
5. Result count displayed (e.g., "Found 5 transactions matching 'coffee':")
6. Empty result handled (e.g., "No transactions found matching 'coffee'")
7. Search works in both Arabic and English

---

## Checklist Results Report

_(This section will be populated after executing the PM checklist to validate PRD completeness and quality.)_

**Checklist Status:** Pending execution

**Next Action:** Run `.bmad-core/checklists/pm-checklist.md` to validate:
- Requirements completeness and testability
- Epic and story logical sequencing
- Acceptance criteria clarity
- Alignment with project goals and MVP scope
- Technical feasibility with chosen stack

---

## Next Steps

### UX Expert Prompt

Review the PRD's User Interface Design Goals section and create a comprehensive UX architecture document. Focus on conversational design patterns, error handling flows, and user confirmation mechanisms. Ensure the design supports both Arabic and English users with culturally appropriate interaction patterns.

### Architect Prompt

Using this PRD as input, create a detailed technical architecture document. Define the Convex schema, API structure, bot server architecture, Rork Toolkit API integration patterns, and deployment strategy. Ensure the architecture supports the NFRs (sub-2-second response time, 85%+ AI accuracy, 99.5% uptime) and scales within Convex free tier constraints for initial 100 users.

---

**Document Owner:** John (Product Manager)  
**Status:** Draft - Ready for Review  
**Next Phase:** UX Architecture & Technical Architecture
