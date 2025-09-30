# Epic 3: Expense & Income Logging with AI

**Version:** 1.0  
**Date:** 2025-09-30  
**Epic ID:** Epic 3

---

## Goal

Implement AI-powered natural language processing using Rork Toolkit API to enable users to log expenses and income through conversational messages. The AI extracts transaction details (amount, description, category) and presents them for user confirmation before saving. This epic delivers the core value proposition of zero-friction financial tracking.

---

## Story 3.1: Rork Toolkit API Integration

**As a** developer,  
**I want** Convex functions to call Rork Toolkit API for natural language understanding,  
**so that** the bot can intelligently interpret user messages.

### Acceptance Criteria

1. Rork Toolkit API credentials loaded from `config.api.json` or environment variables
2. Convex action `callRorkAPI` created to send messages to Rork LLM endpoint
3. API request includes system prompt defining bot's role and capabilities
4. API response parsed to extract structured data (intent, entities, confidence)
5. Error handling for API failures (timeout, rate limit, invalid response) with retry logic
6. API call latency logged for performance monitoring
7. Function calling capability tested with sample prompts and verified in Convex logs

---

## Story 3.2: Expense Logging with AI Extraction

**As a** user,  
**I want** to type "paid 50 for coffee" and have the bot understand and log it,  
**so that** I can track expenses without structured commands.

### Acceptance Criteria

1. Convex `transactions` table schema defined with fields: `userId`, `accountId`, `type` (expense/income), `amount`, `description`, `category`, `date`, `createdAt`
2. Bot sends user message to Rork API with prompt to extract: amount, description, implied category
3. AI response parsed to extract transaction details
4. Bot presents extracted details to user for confirmation (e.g., "💸 Expense: 50 EGP for 'coffee' from Main Bank. Confirm?")
5. User can confirm (✅), cancel (❌), or edit details by replying
6. On confirmation, transaction saved to database and account balance decremented
7. Confirmation message includes updated balance (e.g., "✅ Logged! New balance: 2950 EGP")

---

## Story 3.3: Income Logging with AI Extraction

**As a** user,  
**I want** to type "received salary 5000" and have it logged as income,  
**so that** I can track all money coming in.

### Acceptance Criteria

1. Bot detects income intent from keywords like "received", "earned", "استلمت", "حصلت على"
2. AI extracts amount and description from user message
3. Bot presents extracted income details for confirmation (e.g., "💰 Income: 5000 EGP for 'salary' to Main Bank. Confirm?")
4. On confirmation, transaction saved with type='income' and account balance incremented
5. Confirmation message includes updated balance
6. Income transactions distinguished from expenses in database and future queries
7. Handles edge cases: missing amount (prompts user), ambiguous description (asks for clarification)

---

## Story 3.4: Transaction Categorization

**As a** user,  
**I want** my expenses automatically categorized (food, transport, shopping, etc.),  
**so that** I can understand my spending patterns without manual tagging.

### Acceptance Criteria

1. AI prompt includes instruction to infer category from transaction description
2. Categories defined: Food & Dining, Transportation, Shopping, Bills & Utilities, Entertainment, Health, Other
3. AI returns category with confidence score
4. Category stored in `transactions` table
5. Low-confidence categorizations (< 70%) flagged as "Other" with option for user to correct
6. Bot displays category in confirmation message (e.g., "💸 Expense: 50 EGP for 'coffee' (Food & Dining)")
7. Category accuracy measured and logged for future AI prompt optimization

---

## Story 3.5: Multi-Account Transaction Support

**As a** user,  
**I want** to specify which account an expense comes from,  
**so that** I can track spending across different accounts accurately.

### Acceptance Criteria

1. Bot detects account specification in messages like "paid 50 from credit card" or "دفعت 50 من البنك"
2. If account not specified, default account used automatically
3. AI extracts account name from user message and matches to existing accounts
4. If account name ambiguous or not found, bot asks for clarification with account list
5. Transaction linked to specified account in database
6. Account balance updated for the correct account
7. Confirmation message includes account name (e.g., "✅ Logged to Credit Card! New balance: 1500 EGP")

---

**Related Documents:**
- [Epic List](./epics.md)
- [Epic 2: Accounts](./epic-2-accounts.md)
- [Epic 4: Loans](./epic-4-loans.md)
- [Requirements](./requirements.md)
- [Technical Assumptions](./technical-assumptions.md)
