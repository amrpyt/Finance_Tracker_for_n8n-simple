# Epic 2: Account Management & Balance Tracking

**Version:** 1.0  
**Date:** 2025-09-30  
**Epic ID:** Epic 2

---

## Goal

Enable users to create, manage, and view multiple financial accounts (bank accounts, cash, credit cards) with real-time balance tracking. This epic delivers the foundational data model for all financial transactions and allows users to check their balances instantly via natural language queries.

---

## Story 2.1: Account Creation via Natural Language

**As a** user,  
**I want** to create a new account by typing a simple message,  
**so that** I can start tracking my finances without complex forms.

### Acceptance Criteria

1. Convex `accounts` table schema defined with fields: `userId`, `name`, `type`, `balance`, `currency`, `createdAt`
2. Convex mutation `createAccount` accepts account name, type (bank/cash/credit), and initial balance
3. Bot detects account creation intent from messages like "create bank account" or "أضف حساب نقدي"
4. Bot prompts for account name if not provided (e.g., "What should I call this account?")
5. Bot prompts for initial balance (defaults to 0 if not provided)
6. Account created in database linked to user's Telegram ID
7. Confirmation message sent with account details (e.g., "✅ Created 'Main Bank' with balance 5000 EGP")

---

## Story 2.2: List All Accounts with Balances

**As a** user,  
**I want** to view all my accounts and their current balances,  
**so that** I have a complete overview of my finances.

### Acceptance Criteria

1. Convex query `getUserAccounts` retrieves all accounts for a specific user
2. Bot responds to commands like "show accounts", "list accounts", "عرض الحسابات"
3. Response formatted as a list with account name, type, and balance (e.g., "🏦 Main Bank: 5000 EGP")
4. Total balance across all accounts calculated and displayed at the end
5. Empty state handled gracefully (e.g., "You don't have any accounts yet. Create one by typing 'create account'")
6. Accounts sorted by creation date (oldest first)
7. Response uses emoji for visual clarity (🏦 bank, 💵 cash, 💳 credit card)

---

## Story 2.3: Default Account Selection
**As a** user,  
**I want** one account to be my default for transactions,  
**so that** I don't have to specify the account every time I log an expense.

### Acceptance Criteria

1. `accounts` table includes `isDefault` boolean field
2. First account created automatically set as default
3. Convex mutation `setDefaultAccount` allows changing default account
4. Bot responds to commands like "set Main Bank as default" or "اجعل الحساب النقدي الافتراضي"
5. Only one account can be default at a time (setting new default removes flag from previous)
6. Default account indicated in account list with ⭐ emoji
7. Confirmation message sent when default changed (e.g., "⭐ 'Main Bank' is now your default account")

---

## Story 2.4: Account Balance Updates (Manual) — SKIPPED

Status: SKIPPED (2025-10-02)

Rationale:
- Manual balance overrides conflict with the AI-first, no-manual-actions policy.
- Data integrity and auditability risks; prefer corrections via transparent transaction adjustments.
- Simpler UX and reduced error surface area.
- Focus scope on AI-driven flows (Story 2.5 balance check, Epic 3 transactions) to influence balances.

**As a** user,  
**I want** to manually adjust an account balance,  
**so that** I can correct errors or sync with my actual bank balance.

### Acceptance Criteria

1. Convex mutation `updateAccountBalance` accepts account ID and new balance
2. Bot detects balance update intent from messages like "set Main Bank balance to 3000" or "عدل رصيد الحساب النقدي إلى 500"
3. Bot confirms current balance and asks for confirmation before updating
4. Balance updated in database with timestamp
5. Confirmation message sent with old and new balance (e.g., "Updated 'Main Bank': 5000 → 3000 EGP")
6. Balance change logged as a special transaction type for audit trail
7. Negative balances allowed (for credit cards or overdrafts)

---

## Story 2.5: Instant Balance Check via Natural Language

**As a** user,  
**I want** to ask "what's my balance?" and get an instant answer,  
**so that** I can quickly check my finances without navigating menus.

### Acceptance Criteria

1. Bot detects balance query intent from messages like "balance", "كم رصيدي", "how much do I have?"
2. If user has one account, balance displayed immediately
3. If user has multiple accounts, default account balance shown with option to see all
4. Response includes account name and balance (e.g., "💰 Main Bank: 3000 EGP")
5. Response time under 2 seconds from message to reply
6. Query works in both Arabic and English with language detection
7. Handles edge cases: no accounts (prompts to create one), zero balance (displays "0 EGP")

---

**Related Documents:**
- [Epic List](./epics.md)
- [Epic 1: Foundation](./epic-1-foundation.md)
- [Epic 3: Transactions](./epic-3-transactions.md)
- [Requirements](./requirements.md)
