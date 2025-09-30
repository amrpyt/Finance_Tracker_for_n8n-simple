# Requirements - Personal Finance Tracker

**Version:** 1.0  
**Date:** 2025-09-30

---

## Functional Requirements

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

---

## Non-Functional Requirements

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

**Related Documents:**
- [Overview](./overview.md)
- [UI Design Goals](./ui-design.md)
- [Epic List](./epics.md)
